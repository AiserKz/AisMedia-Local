const LeftCardSkeleton = () => {
    return (
        <div className="card w-full skeleton animate-pulse gap-3">
            <div className="rounded-lg bg-base-100 gap-2 p-5" />           
            <div className=" gap-4 flex flex-row justify-between">
                <div className="w-13 rounded-xl ring-primary ring-2"/>
                <div className="bg-base-100 py-5 rounded-xl w-full"/>
            </div>
        </div>
    )
}
export default LeftCardSkeleton