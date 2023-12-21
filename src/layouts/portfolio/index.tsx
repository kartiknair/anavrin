import { FC, useState, useEffect } from "react";
import { clsx } from "clsx";
import NProgress from "nprogress";
import { Drawer } from "vaul";

import { Button } from "@/components/ui/button";
import PortfolioLayoutSecondaryPanel from "@/components/portfolio-secondary-panel/portfolio-secondary-panel";
import useModal from "../../hooks/useModal";
import PortfolioOptions from "../../components/portfolio-options";
import PortfolioTable from "../../components/portfolio-table";
import AddAssetModal from "../../components/add-asset-modal";
import {
  AssetType,
  getPortfolioExpandableComponent,
  getPortfolioRowDoubleClickHandler,
  getPortfolioSummaryMemoized,
  getPortfolioTableSchema,
  updatePortfolio
} from "../../lib/portfolio-utils";
import {
  convertCryptoPortfolioItemToPersistence,
  convertDividendPortfolioItemToPersistence,
  hydrateCryptoPortfolioItems,
  hydrateDividendPortfolioItems
} from "../../lib/portfolio-asset-utils";
import EditAssetModal from "../../components/edit-asset-modal";
import PortfolioAnalysisHeader from "../../components/portfolio-analysis-header";
import api from "../../services/create-service";

type PortfolioLayoutProps = {
  portfolio: Portfolio;
};

const portfolioHydrationFnMapper = new Map<
  AssetType,
  (portfolio: Portfolio) => Promise<unknown[]>
>();
portfolioHydrationFnMapper.set(AssetType.CRYPTO, hydrateCryptoPortfolioItems);
portfolioHydrationFnMapper.set(AssetType.STOCK, hydrateDividendPortfolioItems);

const portfolioSaveFnMapper = new Map<AssetType, (portfolioItem) => Promise<PortfolioItem[]>>();

portfolioSaveFnMapper.set(AssetType.CRYPTO, data =>
  data.map(item => convertCryptoPortfolioItemToPersistence(item))
);
portfolioSaveFnMapper.set(AssetType.STOCK, data =>
  data.map(item => convertDividendPortfolioItemToPersistence(item))
);

const PortfolioLayout: FC<PortfolioLayoutProps> = ({ portfolio }) => {
  // Extract the portfolioType and items.
  const { assetType: portfolioType } = portfolio;
  const [portfolioDomainObject, setPortfolioDomainObject] = useState<Portfolio>({
    assetType: "",
    items: []
  });
  const { isShowing, toggle } = useModal(false);
  const { isShowing: isEditModalShowing, toggle: toggleEditModal } = useModal(false);
  const [hideSecondaryPanel, setHideSecondaryPanel] = useState(true);
  const [portfolioData, setPortfolioData] = useState([]);
  const [portfolioTableLoading, setPortfolioTableLoading] = useState(false);

  const {
    totalInvested,
    portfolioValue,
    percentageChange,
    ringChartData,
    dividendIncome,
    portfolioDividendYield,
    portfolioDividendEfficiency
  } = getPortfolioSummaryMemoized(portfolioData, portfolioType);

  const [assetToBeEdited, setAssetToBeEdited] = useState(undefined);

  const portfolioTableSchema = getPortfolioTableSchema(portfolioType);
  const portfolioExpandableComponent = getPortfolioExpandableComponent(portfolioType);
  const portfolioRowDoubleClickHandler = getPortfolioRowDoubleClickHandler(portfolioType, {
    toggleEditModal,
    setAssetToBeEdited
  });

  const onAssetAdd = asset => {
    portfolioData.push(asset);
  };

  const onAssetEdit = asset => {
    const updatedPortfolioData = updatePortfolio(portfolioData, asset, "token");
    setPortfolioData(updatedPortfolioData);
  };

  const onPortfolioSave = async () => {
    try {
      NProgress.start();

      console.log("Saving portfolio");
      const portfolioItems = await portfolioSaveFnMapper.get(portfolioType)(portfolioData);

      const result = await api.saveUserPortfolio({
        portfolio: {
          ...portfolioDomainObject,
          assetType: portfolioType,
          items: portfolioItems
        }
      });

      const { data } = result;
      setPortfolioDomainObject(data.value);
      console.log(data);
      // Success handling here
    } catch (error) {
      // Error handling here
      console.error(error);

      if (error.response) {
        // Handle known error types returned by the API
        const { data } = error.response;
        switch (data.type) {
          case "UserNotLoggedIn":
            // Handle the "UserNotLoggedIn" error
            break;
          case "MaxPortfoliosReached":
            // Handle the "MaxPortfoliosReached" error
            break;
          case "FailedToUpdatePortfolio":
            // Handle the "FailedToUpdatePortfolio" error
            break;
          default:
            // Handle other known errors returned by the API
            break;
        }
      } else if (error.request) {
        // Handle network errors (e.g. server not responding)
        console.log("Server not responding");
      } else {
        // Handle other types of errors (e.g. unexpected errors)
        console.log("Unexpected error occurred");
      }
    } finally {
      NProgress.done();
    }
  };

  const onPortfolioDelete = async () => {
    try {
      NProgress.start();
      console.log("Deleting portfolio");
      const result = await api.deleteUserPortfolio({ portfolio: portfolioDomainObject });

      const { data } = result;
      console.log(data);
      // Success handling here
    } catch (error) {
      // Error handling here
      console.error(error);

      if (error.response) {
        // Handle known error types returned by the API
        const { data } = error.response;
        switch (data.type) {
          case "UserNotLoggedIn":
            // Handle the "UserNotLoggedIn" error
            break;
          case "NoMatchingPortfolio":
            // Handle the "NoMatchingPortfolio" error
            break;
          case "FailedToDeletePortfolio":
            // Handle the "FailedToUpdatePortfolio" error
            break;
          default:
            // Handle other known errors returned by the API
            break;
        }
      } else if (error.request) {
        // Handle network errors (e.g. server not responding)
        console.log("Server not responding");
      } else {
        // Handle other types of errors (e.g. unexpected errors)
        console.log("Unexpected error occurred");
      }
    } finally {
      NProgress.done();
    }
  };

  const onPortfolioRowDelete = async updatedPortfolio => {
    setPortfolioData(updatedPortfolio);
  };

  useEffect(() => {
    console.log("useEffect layouts/portfolio");
    NProgress.start();

    /**
     * Depending on the portfolio/asset Type hydrates data
     * such that it is understood by the tableSchema
     */
    async function hydratePortfolioItemsData() {
      const data = await portfolioHydrationFnMapper.get(portfolioType)(portfolio);
      setPortfolioData(data);
      setPortfolioTableLoading(false);
      NProgress.done();
    }
    setPortfolioTableLoading(true);
    hydratePortfolioItemsData();

    setPortfolioDomainObject(portfolio);
  }, [portfolio]);

  console.log("layouts/Portfolio -> render");
  return (
    <>
      <Drawer.Root>
        {isShowing ? (
          <AddAssetModal
            isShowing={isShowing}
            cancel={toggle}
            assetType={portfolioType}
            onSubmit={onAssetAdd}
          />
        ) : null}
        {assetToBeEdited ? (
          <EditAssetModal
            isShowing={isEditModalShowing}
            cancel={toggleEditModal}
            assetType={portfolioType}
            onSubmit={onAssetEdit}
            asset={assetToBeEdited}
          />
        ) : null}
        <div className="flex h-full w-full flex-1 flex-col rounded-t-lg md:flex-row md:space-x-2">
          <div
            className={clsx("portfolio-default-primary-panel flex flex-col overflow-y-auto", {
              "md:w-full": hideSecondaryPanel,
              "md:w-8/12": !hideSecondaryPanel
            })}
            style={{ height: "100%" }}
          >
            <div className="flex h-20 flex-row">
              <PortfolioAnalysisHeader
                totalInvested={totalInvested}
                portfolioValue={portfolioValue}
                percentageChange={percentageChange}
              />
              <div className="w-1/3">
                <PortfolioOptions
                  openAddAssetModal={toggle}
                  savePortfolio={onPortfolioSave}
                  deletePortfolio={onPortfolioDelete}
                  togglePortfolioAnalysisPanel={() => setHideSecondaryPanel(!hideSecondaryPanel)}
                />
              </div>
            </div>
            {/* Occupy Max remaining space and scroll only table */}
            <section className="mt-2 flex-1 overflow-y-auto">
              <PortfolioTable
                tableSchema={portfolioTableSchema}
                data={portfolioData}
                loading={portfolioTableLoading}
                expandableComponent={portfolioExpandableComponent}
                onRowDoubleclick={portfolioRowDoubleClickHandler}
                showRowDeleteButton
                onRowDelete={onPortfolioRowDelete}
              />
            </section>
          </div>
          <div
            className={clsx("portfolio-secondary-panel max-h-full overflow-hidden rounded-lg", {
              hidden: hideSecondaryPanel,
              "md:w-4/12": !hideSecondaryPanel
            })}
          >
            {hideSecondaryPanel ? null : (
              <div
                className={clsx("h-full w-full", {
                  hidden: hideSecondaryPanel,
                  "hidden w-full md:block": !hideSecondaryPanel
                })}
              >
                <PortfolioLayoutSecondaryPanel
                  portfolioType={portfolioType}
                  ringChartData={ringChartData}
                  dividendIncome={dividendIncome}
                  portfolioDividendYield={portfolioDividendYield}
                  portfolioDividendEfficiency={portfolioDividendEfficiency}
                />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-full w-full hover:bg-transparent hover:text-white"
            >
              <Drawer.Trigger>Analyse Portfolio</Drawer.Trigger>
            </Button>
          </div>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 flex max-h-[70%] flex-col rounded-t-[10px] bg-charcoal-400">
              <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
                <PortfolioLayoutSecondaryPanel
                  portfolioType={portfolioType}
                  ringChartData={ringChartData}
                  dividendIncome={dividendIncome}
                  portfolioDividendYield={portfolioDividendYield}
                  portfolioDividendEfficiency={portfolioDividendEfficiency}
                />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </div>
      </Drawer.Root>
    </>
  );
};
export default PortfolioLayout;
