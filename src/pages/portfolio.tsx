import { Tab, Tabs } from "@mantine/core";
import dynamic from "next/dynamic";
import { FC, useState } from "react";
import AddNewPortfolioModal from "../components/add-new-portfolio-modal";
import LoadingForm from "../components/exchanges-form/loading";
import MaxPortfolioReachedModal from "../components/max-portfolio-reached-modal";
import useModal from "../hooks/useModal";
import DefaultLayout from "../layouts/default";
import { PortfolioType } from "../lib/portfolio-utils";

const LazyLoadPortfolio = dynamic(() => import("../layouts/portfolio"), {
  loading: LoadingForm,
  ssr: false
});

const Portfolio: FC = () => {
  const [tabCount, setTabCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const { isShowing: isCreatePortfolioModalShowing, toggle: toggleCreatePortfolioModal } =
    useModal(false);
  const { isShowing: isMaxPortfolioWarningShowing, toggle: toggleMaxPortfolioWarningModal } =
    useModal(false);

  const handlePortfolioTypeSelection = (portfolioType: PortfolioType) => {
    toggleCreatePortfolioModal();
    setTabCount(tabCount + 1);
  };

  const handleTabChange = (tabIndex: number) => {
    const dummyVal = 2;
    const PortfolioLimit = 2;

    if (tabIndex === tabCount + dummyVal - 1) {
      if (tabCount >= PortfolioLimit) {
        toggleMaxPortfolioWarningModal();
        console.log("Max Portfolios created");
        return;
      }
      toggleCreatePortfolioModal();
    } else {
      setActiveTab(tabIndex);
    }
  };

  return (
    <>
      <DefaultLayout
        title="Portfolio"
        sidebar="portfolio"
        description="You can see your portfolios estimated value & progress below"
      >
        <AddNewPortfolioModal
          isShowing={isCreatePortfolioModalShowing}
          cancel={toggleCreatePortfolioModal}
          onSelection={handlePortfolioTypeSelection}
        />
        <MaxPortfolioReachedModal
          isShowing={isMaxPortfolioWarningShowing}
          cancel={toggleMaxPortfolioWarningModal}
        />
        <div className="portfolio-primary-panel flex flex-col overflow-y-auto">
          <Tabs active={activeTab} onTabChange={handleTabChange}>
            <Tab label="Portfolio 1">
              <LazyLoadPortfolio portfolioType={PortfolioType.CRYPTO} />
            </Tab>
            {new Array(tabCount).fill(0).map((item, key) => (
              <Tab key="portfolio-placeholder" label={`Portfolio ${key}`}>
                Messages tab content
              </Tab>
            ))}
            <Tab
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />
          </Tabs>
        </div>
      </DefaultLayout>
    </>
  );
};

export default Portfolio;
