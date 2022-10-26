import { FC, useState } from "react";
import { Accordion } from "@mantine/core";
import { useSession } from "next-auth/react";
import DefaultLayout from "../layouts/default";
import * as exchanges from "../components/exchanges-form";
import { isMobileUI } from "../lib/viewport";
import SecondaryPanel from "../components/secondary-panel";
import { UserSettingsComponentMapping, PanelKeys } from "../lib/user-settings-component-map";

const UserSettings: FC = () => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [opened, setOpened] = useState(false);
  const isSignedIn = loading ? "" : Boolean(session?.user) ?? false;
  const [panel, setPanel] = useState<PanelKeys>(null);
  const [menuItem, setMenuItem] = useState<string>();

  const onExchangeButtonClick = (exchange: PanelKeys) => {
    // Pass in the exchange name which can be understood by the Form Factory.
    // sets the secondary Panel.
    setPanel(exchange);
    // Only in Mobile UI should the Secondary Panel as a drawer.
    if (isMobileUI()) {
      setOpened(true);
    }
  };

  const Exchanges = exchanges.list.map(exchange =>
    // eslint-disable-next-line import/namespace
    exchanges[exchange]({ onClick: onExchangeButtonClick })
  );

  const onMenuItemClick = MenuState => {
    // MenuState: {0: true, 1: false}

    const selectedMenuItem = Object.entries(MenuState).find(menuStateItem => {
      const [menuKey, isOpened] = menuStateItem;
      return isOpened;
    })?.[0];

    switch (selectedMenuItem) {
      case "0": // Exchange Selection
        break;
      case "1": // WebPush Menu Item
        setPanel(PanelKeys.WEBPUSH);
        break;
      default:
        break;
    }
  };
  return (
    <>
      <DefaultLayout title="User setting" sidebar="" description="Update user profile">
        <div className="flex h-full w-full flex-row">
          <div className="dashboard-primary-panel">
            {!isSignedIn ? <h1 className="mb-2 text-2xl">Please Login.</h1> : null}
            <Accordion
              initialItem={-1}
              className="border-t-0 border-b border-gray-400"
              onChange={onMenuItemClick}
            >
              <Accordion.Item
                className="border-t-0 border-b border-gray-400 font-normal"
                label={
                  <h1 className="mb-2 text-2xl">
                    Connect <span className="font-semibold">Anavrin</span> to an exchange account.
                  </h1>
                }
              >
                <p className="text-md text-gray-600">We currently only support Binance exchange.</p>
                <section className="my-4 grid grid-cols-4 gap-4">{Exchanges}</section>
              </Accordion.Item>
              <Accordion.Item
                label={<h1 className="mb-2 text-2xl">Authorize webpush subscriptions.</h1>}
              />
            </Accordion>
          </div>
          <SecondaryPanel
            PanelComponentMapping={UserSettingsComponentMapping}
            panel={panel}
            opened={opened}
            setOpened={setOpened}
          />
        </div>
      </DefaultLayout>
    </>
  );
};

export default UserSettings;
