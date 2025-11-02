import PageLayout from "../components/layouts/PageLayout";
import PageHeader from "../components/layouts/PageHeader";
import ResearchRepository from "../components/ui/ResearchRepository";

const Repository = () => {
    return (
        <PageLayout bgColor="bg-gray-50">
            {/* {Repository section} */}
            <div
                className="my-4 bg-white rounded-2xl shadow-soft animate-fade-in-up"
                style={{ animationDelay: "800ms" }}
            >
                <ResearchRepository />
            </div>
        </PageLayout>
    );
};
export default Repository;
