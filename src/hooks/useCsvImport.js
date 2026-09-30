import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";

const BATCH_SIZE = 25;

const EMPTY = {
    phase: "idle",      // idle | options | reading | importing | done | error | cancelled
    fileName: "",
    total: 0,
    processed: 0,
    imported: 0,
    updated: 0,
    skipped: [],
    error: "",
    duplicateMode: "add"
};

/**
 * Imports a CSV in small batches so the UI can show real progress.
 *
 * The file is parsed in the browser, then sent to `sendBatch` a few rows at a
 * time. Progress is the share of rows actually confirmed by the server — not a
 * guess — and the import can be stopped part-way.
 *
 * With `askDuplicateMode`, the file waits at an "options" step first so the
 * shopkeeper can say what should happen to items already in their list.
 *
 *   const csvImport = useCsvImport({ sendBatch: importProductsBatch });
 *   csvImport.start(file);
 */
export function useCsvImport({ sendBatch, batchSize = BATCH_SIZE, onFinished, askDuplicateMode = false }) {

    const [state, setState] = useState(EMPTY);
    const cancelled = useRef(false);
    const pendingFile = useRef(null);

    const reset = useCallback(() => {
        cancelled.current = false;
        pendingFile.current = null;
        setState(EMPTY);
    }, []);

    const cancel = useCallback(() => {
        cancelled.current = true;
        setState((current) => ({
            ...current,
            phase: current.phase === "options" ? "idle" : "cancelled"
        }));
    }, []);

    const setDuplicateMode = useCallback((duplicateMode) => {
        setState((current) => ({ ...current, duplicateMode }));
    }, []);

    const run = useCallback(async (file, duplicateMode) => {
        cancelled.current = false;
        setState((current) => ({
            ...EMPTY,
            duplicateMode,
            phase: "reading",
            fileName: file.name
        }));

        let rows;

        try {
            rows = await new Promise((resolve, reject) => {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: "greedy",
                    complete: (result) => resolve(result.data || []),
                    error: reject
                });
            });
        } catch {
            setState((current) => ({ ...current, phase: "error", error: "That file could not be read as CSV." }));
            return;
        }

        // Drop rows where every cell is blank.
        rows = rows.filter((row) => Object.values(row).some((value) => String(value ?? "").trim()));

        if (rows.length === 0) {
            setState((current) => ({ ...current, phase: "error", error: "This file has no rows to import." }));
            return;
        }

        setState((current) => ({ ...current, phase: "importing", total: rows.length }));

        let imported = 0;
        let updated = 0;
        let processed = 0;
        const skipped = [];

        for (let offset = 0; offset < rows.length; offset += batchSize) {
            if (cancelled.current) break;

            const chunk = rows.slice(offset, offset + batchSize);

            try {
                const result = await sendBatch({ rows: chunk, rowOffset: offset, duplicateMode });

                imported += result?.importedCount || 0;
                updated += result?.updatedCount || 0;
                if (result?.skipped?.length) skipped.push(...result.skipped);

            } catch (error) {
                // Snapshot the counters: referencing the loop variables inside
                // the state updater would capture them after further mutation.
                const failedAt = { processed, imported, updated, skipped: [...skipped] };
                const reason =
                    error?.response?.data?.message ||
                    `Stopped after ${failedAt.processed} rows. Check your connection and try again.`;

                setState((current) => ({ ...current, ...failedAt, phase: "error", error: reason }));
                return;
            }

            processed += chunk.length;

            const progress = { processed, imported, updated, skipped: [...skipped] };
            setState((current) => ({ ...current, ...progress }));
        }

        setState((current) => ({
            ...current,
            phase: cancelled.current ? "cancelled" : "done",
            processed,
            imported,
            updated,
            skipped
        }));

        if (imported > 0 || updated > 0) await onFinished?.({ imported, updated, skipped });
    }, [sendBatch, batchSize, onFinished]);

    const start = useCallback((file) => {
        if (!file) return;

        if (askDuplicateMode) {
            // Hold the file until the shopkeeper picks what to do with items
            // they already have.
            pendingFile.current = file;
            setState({ ...EMPTY, phase: "options", fileName: file.name });
            return;
        }

        run(file, EMPTY.duplicateMode);
    }, [askDuplicateMode, run]);

    const confirm = useCallback(() => {
        const file = pendingFile.current;
        pendingFile.current = null;

        if (file) run(file, state.duplicateMode);
    }, [run, state.duplicateMode]);

    const percent = state.total
        ? Math.round((state.processed / state.total) * 100)
        : state.phase === "reading" ? 2 : 0;

    return {
        ...state,
        percent,
        busy: state.phase === "reading" || state.phase === "importing",
        start,
        confirm,
        setDuplicateMode,
        cancel,
        reset
    };
}

export default useCsvImport;
