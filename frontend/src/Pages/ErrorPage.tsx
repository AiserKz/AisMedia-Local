import { Link } from 'react-router-dom';
import IonIcon from "@reacticons/ionicons";


const ErrorPage = ({ error }: { error: string }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[70vh]">
            <div className="card flex flex-col items-center w-full">
                <IonIcon name="alert-circle-outline" className="text-6xl text-error mb-4" />
                <h1 className="text-6xl font-bold text-error mb-2">404</h1>
                <p className="text-lg text-base-content mb-6"> {error || "Страница не найдена"}</p>
                <Link to="/" className="btn btn-primary">
                    На главную
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;