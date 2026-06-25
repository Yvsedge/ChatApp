import Main from "../components/Dashboard/Main";
import Sidebar from "../components/Dashboard/Sidebar";

type Props = {
};

export default function Dashboard({}: Props) {
    return (
        <>
            <div className="dashboardContainer flex h-full w-full">
                <Sidebar></Sidebar>
                <Main></Main>
            </div>
        </>
    );
}
