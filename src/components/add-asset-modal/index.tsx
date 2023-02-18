import { FC, useEffect, useState } from "react";
import cn from "classnames";
import getStockInformation from "../../util/getStockInformation";
import useStockInformation from "../../hooks/useStockInformation";
import StockSearchCombobox from "../stock-search-combobox";
import useStockSearch from "../../hooks/useStockSearch";
import StockInformationTable from "./stock-information-table";
import CryptocurrencySearchBox from "../cryptocurrency-search-box";
import UtilityFooter from "./stock-modal-utility-footer";
import { AssetType, getAddAssetModalTitle } from "../../lib/portfolio-utils";
import AddCryptoForm from "./add-crypto-form";

type AddAssetModalProps = {
  isShowing: boolean;
  cancel: () => void;
  assetType: AssetType;
};

enum SearchState {
  STABLE = "STABLE",
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  FAILURE = "FAILURE"
}

const ButtonPanel = ({ cancel, formState, formValid }) => (
  // <div className="text-center md:text-right mt-4 md:flex md:justify-end">
  <div className="mx-2 flex h-full flex-row items-center justify-between rounded-lg bg-charcoal-900 p-2 align-middle font-light">
    <ul className="nav flex flex-row items-center text-xs">
      <button
        type="button"
        className={cn(
          "inline-block w-auto rounded-lg py-2 pl-1 pr-2 text-xs font-semibold text-gray-500",
          {
            "animate-bounce": formValid
          }
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="mr-2 inline-flex h-6 w-6 rounded-md bg-charcoal-300 p-1 text-charcoal-900"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        Click to Proceed{" "}
      </button>
    </ul>
    <ul className="nav flex flex-row space-x-3 text-xs">
      {/* <button
        type="button"
        className="block w-full md:inline-block pr-3 md:w-auto bg-charcoal-400 text-gray-500 hover:bg-green-300 hover:text-charcoal-900 rounded-md font-semibold text-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-8 p-2 mr-2 inline-flex bg-green-300 text-charcoal-900 rounded-md"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        Add Stock{" "}
      </button> */}
      <button
        type="button"
        className="inline-block w-auto rounded-lg bg-charcoal-400 py-2 pl-1 pr-2 text-center font-semibold text-gray-500 hover:bg-green-300 hover:text-charcoal-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="mr-1 inline-flex w-6 rounded-md bg-green-300 p-1 text-charcoal-900"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        Add Stock{" "}
      </button>
      <button
        type="button"
        className="inline-block w-auto rounded-lg bg-charcoal-400 py-2 pl-1 pr-2 font-semibold text-gray-500 hover:bg-red-300 hover:text-charcoal-900"
        onClick={cancel}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="mr-1 inline-flex w-6 rounded-md bg-red-300 p-1 text-charcoal-900"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>{" "}
        Cancel
      </button>
    </ul>
  </div>
);

const AddAssetModal: FC<AddAssetModalProps> = ({ isShowing, cancel, assetType }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const [stockQuantity, setStockQuantity] = useState("");
  const [stockShares, setStockShares] = useState("");
  const [ticker, setTicker] = useState("");

  const [stock, setStock] = useState(null);
  const { stockSuggestions, _isLoading, _isError } = useStockSearch(ticker || null);

  const [searchState, setSearchState] = useState(SearchState.STABLE);
  const [isStockQuantityValid, setStockQuantityValidity] = useState(false);
  const [isStockSharesValid, setStockSharesValidity] = useState(false);

  const [formState, setFormState] = useState(0);
  const [formValid, setFormValid] = useState(false);

  const modalTitle = getAddAssetModalTitle(assetType);
  const isFormValid = () => {
    const isformValid =
      searchState === SearchState.SUCCESS && isStockQuantityValid && isStockSharesValid;
    setFormValid(!!isformValid);
    console.log(searchState, isStockQuantityValid, isStockSharesValid, isformValid, formValid);
  };

  const fetchStock = stockTicker => {
    setSearchState(SearchState.PENDING);
    getStockInformation(stockTicker)
      .then(({ status, data: stockData }) => {
        if (status === 200) {
          setSearchState(SearchState.SUCCESS);
          isFormValid();
          setStock(stockData);
        }
      })
      .catch(e => {
        console.error(e);
        setSearchState(SearchState.FAILURE);
      })
      .finally(() => {
        console.log("request completed");
      });
  };

  const onStockQuantityChange = e => {
    setStockQuantity(e.target.value);
    setStockQuantityValidity(e.target.checkValidity());
    isFormValid();
  };

  const onStockSharesChange = e => {
    setStockShares(e.target.value);
    setStockSharesValidity(e.target.checkValidity());
    isFormValid();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log("Setting Ticker");
      // setSearchState(SearchState.STABLE);
      setTicker(searchTerm);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div
      className={cn("fixed inset-0 z-10 px-4 md:flex md:items-center md:justify-center", {
        hidden: !isShowing,
        "md:hidden": !isShowing
      })}
    >
      <div
        className="absolute inset-0 z-10 w-full bg-black opacity-75"
        onClick={cancel}
        onKeyDown={cancel}
        aria-hidden="true"
      />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-4 mb-4 rounded-lg bg-white p-2 shadow-lg md:relative md:mx-auto md:w-full md:max-w-lg">
        <div className="flex flex-col px-2 py-5 sm:px-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">{modalTitle}</h3>
        </div>
        <div className="border-t border-gray-200 py-2">
          <dl>
            {/* <div className="bg-gray-50 p-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-2">
              <dt className="rounded-md bg-charcoal-400 py-2 px-4 text-sm font-semibold text-gray-400">
                Ticker
              </dt>
              <dd className="relative flex flex-row rounded-md text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <StockSearchCombobox
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  stockSuggestions={stockSuggestions}
                  fetchStock={fetchStock}
                  searchState={searchState}
                />
              </dd>
            </div>
            <div className="bg-white p-2 text-gray-600 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-2">
              <dt className="rounded-md bg-charcoal-400 py-2 px-4 text-sm font-semibold text-gray-400">
                Shares
              </dt>
              <dd className="mt-1 rounded-md text-sm sm:col-span-2 sm:mt-0">
                <input
                  type="number"
                  name="shares"
                  id="modal_input_shares"
                  min="0"
                  className="inline-flex w-full items-center rounded bg-gray-300 py-2 px-4 font-semibold text-gray-700"
                  onChange={onStockQuantityChange}
                />
              </dd>
            </div>
            <div className="bg-white p-2 text-gray-600 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-2">
              <dt className="rounded-md bg-charcoal-400 py-2 px-4 text-sm font-semibold text-gray-400">
                Buy Price
              </dt>
              <dd className="mt-1 rounded-md text-sm sm:col-span-2 sm:mt-0">
                <input
                  type="number"
                  name="market_price"
                  id="modal_input_market_price"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="inline-flex w-full items-center rounded bg-gray-300 py-2 px-4 font-semibold text-gray-700"
                  onChange={onStockSharesChange}
                />
              </dd>
            </div> */}

            {/* <CryptocurrencySearchBox hideHeader setCyptocurrency={setSearchTerm} /> */}
            <AddCryptoForm />
            {stock ? <StockInformationTable stock={stock} /> : null}
          </dl>
        </div>

        {/* <ButtonPanel cancel={cancel} formState={formState} formValid={formValid} /> */}
        <UtilityFooter />
      </div>
    </div>
  );
};

export default AddAssetModal;

// reference
/* https://tailwindcomponents.com/component/modal
   https://codepen.io/iamsahilvhora/pen/LYYxQJw */