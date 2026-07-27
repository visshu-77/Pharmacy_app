
export default function TransparentButton({ name, link='/'}){
    return(
        <div className='flex flex-col justify-center item-center'>
            <a href={link} className='border rounded-xl p-2 text-sm font-semibold'>
            {name}
            </a>
        </div>
    )
}