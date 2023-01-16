import { FC, useEffect, useState } from "react";
import CryptocurrencySearchBox from "../../components/cryptocurrency-search-box";
import Ranker from "../../components/ranker";
import DefaultLayout from "../../layouts/default";
import { fetchCoinInfo } from "../../util/cryptocurrencyService";

const calcScore = coin_info => {
  let score = 0;
  const price_change_24h_weight = 0.3;
  const price_change_7d_weight = 0.2;
  const price_change_14d_weight = 0.1;
  const market_cap_weight = 0.2;
  const trading_volume_weight = 0.2;

  score += coin_info.market_data.price_change_percentage_24h * price_change_24h_weight;
  score += coin_info.market_data.price_change_percentage_7d * price_change_7d_weight;
  score += coin_info.market_data.price_change_percentage_14d * price_change_14d_weight;
  score += Math.log10(coin_info.market_data.market_cap.usd) * market_cap_weight;
  score += Math.log10(coin_info.market_data.total_volume.usd) * trading_volume_weight;
  return score;
};

const CoinInfo = ({ coin }) => (
  <div className="flex flex-col overflow-y-scroll bg-white p-4 shadow-md sm:flex-row">
    <div className="flex w-full flex-col justify-between rounded-lg bg-charcoal-900 p-4 text-gray-100 md:w-1/2 lg:w-1/4">
      <div className="flex items-center py-2">
        <img className="mr-4 h-12 w-12 rounded-full" src={coin.image.large} alt={coin.name} />
        <div>
          <h2 className="text-lg font-medium">{coin.name}</h2>
          <p className="text-sm text-gray-300">{coin.symbol}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="mr-4">
          <p className="text-xs text-gray-300">Market Cap</p>
          <p className="text-sm">{coin.market_data.market_cap.usd} $</p>
        </div>
        <div>
          <p className="text-xs text-gray-300">Total Volume</p>
          <p className="text-sm">{coin.market_data.total_volume.usd} $</p>
        </div>
      </div>
      <div className="mt-4 text-xs">
        <div className="flex justify-between">
          <div className="w-1/2 text-left text-gray-300">
            Current Price: {coin.market_data.current_price.usd} $
          </div>
          <div className="w-1/2 text-left text-gray-300">
            Change in 24h: {coin.market_data.price_change_percentage_24h} %
          </div>
        </div>
        <div className="mt-2 flex justify-between">
          <div className="w-1/2 text-left  text-gray-300">
            High in 24h: {coin.market_data.high_24h.usd} $
          </div>
          <div className="w-1/2 text-left text-gray-300">
            Low in 24h: {coin.market_data.low_24h.usd} $
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg">
        <p className="py-2 text-sm font-medium">Categories:</p>
        <div className="flex flex-wrap">
          {coin.categories.map((category, index) => (
            <span
              key={index}
              className="mr-2 mb-2 rounded-lg bg-charcoal-300 p-2 text-xs font-medium"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-4 p-4">
      <p className="text-lg font-medium">Scores:</p>
      <div className="ml-4">
        <div className="flex justify-between border-b py-2">
          <span className="font-medium">Coingecko Score: </span>
          <span className="ml-2">{coin.coingecko_score}</span>
        </div>
        <div className="flex justify-between  border-b py-2">
          <span className="font-medium">Community Score: </span>
          <span className="ml-2">{coin.community_score}</span>
        </div>
        <div className="flex justify-between  border-b py-2">
          <span className="font-medium">Developer Score: </span>
          <span className="ml-2">{coin.developer_score}</span>
        </div>
        <div className="flex justify-between  border-b py-2">
          <span className="font-medium">Liquidity Score: </span>
          <span className="ml-2">{coin.liquidity_score}</span>
        </div>
        <div className="flex justify-between  py-2">
          <span className="font-medium">Public Interest Score: </span>
          <span className="ml-2">{coin.public_interest_score}</span>
        </div>
        <div className="flex justify-between  py-2">
          <span className="font-medium">Anavrin Score: </span>
          <span className="ml-2">{coin.anavrin_score}</span>
        </div>
      </div>
    </div>
  </div>
);

const SimulatorCryptoCurrency: FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState(undefined);
  const [coinInfo, setCoinInfo] = useState(undefined);
  const [cryptoWatchlist, setCryptoWatchlist] = useState([]);
  useEffect(() => {
    async function fetchData() {
      if (!selectedCrypto) {
        return;
      }
      const data = await fetchCoinInfo(selectedCrypto);
      data.anavrin_score = calcScore(data);
      setCoinInfo(data);

      const isSelectedCryptoInWatchlist = cryptoWatchlist.find(
        crypto => crypto.id === selectedCrypto
      );

      if (!isSelectedCryptoInWatchlist) {
        setCryptoWatchlist([...cryptoWatchlist, data]);
      }
    }
    fetchData();
  }, [cryptoWatchlist, selectedCrypto]);
  return (
    <>
      <DefaultLayout
        title="Simulator"
        sidebar="simulator"
        description="You can see your portfolios estimated value & progress below"
      >
        <div className="bg-gray-200 p-6 shadow-md">
          <CryptocurrencySearchBox setCyptocurrency={setSelectedCrypto} />
        </div>
        {selectedCrypto && coinInfo ? <CoinInfo coin={coinInfo} /> : null}
        <Ranker items={cryptoWatchlist} />
      </DefaultLayout>
    </>
  );
};
export default SimulatorCryptoCurrency;
