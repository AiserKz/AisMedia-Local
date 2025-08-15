export default function SkeletonCard() {
    return (
        <div className="md:w-[22dvh] w-[30dvw] shadow-xl rounded-2xl overflow-hidden animate-pulse bg-base-200">
            <div className="relative w-full aspect-[2/3] bg-base-100" />
            <div className="p-4">
                <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-base-300 rounded w-full mb-1"></div>
                <div className="h-3 bg-base-300 rounded w-2/3"></div>
            </div>
        </div>
    )
}

export function SkeletonGenre() {
    return (
        <li className="w-20 h-8 rounded-lg bg-base-200 animate-pulse flex items-center justify-center">
            <span className="h-3 w-16 bg-base-300 rounded"></span>
        </li>
    );
}