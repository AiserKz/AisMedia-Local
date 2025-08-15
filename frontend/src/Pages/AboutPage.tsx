import { useEffect, useState } from "react"
import api from "../Script/api"



export default function AboutPage() {
    const [data, setData] = useState(null)

    useEffect(() => {
        api.get('/api/test/').then(res => {
            setData(res.data)
        })
    }, [])

    return (
        <div className="text-base-content">
            <h1>Страница о нас</h1>
    
        </div>
    )
}