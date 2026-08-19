
export default function fillButton({ name, link = "/" }) {
    return (
        <div className='flex flex-col justify-center item-center w-1/2 sm:w-auto'>
            <a href={link} className="bg-white text-primary p-2 text-center rounded-xl text-sm font-semibold">
                {name}
            </a>
        </div>
    );
}