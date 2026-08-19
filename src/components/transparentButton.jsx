
export default function TransparentButton({ name, link='/'}){
    return(
        <div className='flex flex-col justify-center item-center sm:w-auto w-1/2'>
            <a href={link} className='border rounded-xl text-center p-2 text-sm font-semibold'>
            {name}
            </a>
        </div>
    )
}