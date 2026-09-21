export default function demo() {
    const data = [
        {
            "id": "1",
            "name": "vishal",
            "designation": "Associate Software Engineer",
            "email": "vishal@example.com",
        },
        {
            "id": "2",
            "name": "vishal",
            "designation": "Associate Software Engineer",
            "email": "vishal@example.com",
        },
        {
            "id": "3",
            "name": "vishal",
            "designation": "Associate Software Engineer",
            "email": "vishal@example.com",
        }
    ]
    return (
        <>
        <div>
            { data.map((item) => {
                return(
                    <div key={item.id}>
                        <h2>{item.name}</h2>
                        <p>{item.designation}</p>
                        <p>{item.email}</p>
                    </div>
                )
            })}
        </div>
        </>
    )
}