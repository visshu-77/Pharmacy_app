
export default function fillButton({ name, link = "/" }) {
    return (
        <div className='flex flex-col justify-center item-center'>
            <a href={link} className="bg-white text-primary p-2 rounded-xl text-sm font-semibold">
                {name}
            </a>
        </div>
    );
}