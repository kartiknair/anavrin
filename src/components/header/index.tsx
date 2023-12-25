import { useSession, signIn, signOut } from "next-auth/react";
import { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { clsx } from "clsx";
import Image from "next/image";
import styles from "./index.module.css";

type HeaderProps = {
  title: string;
  description: string;
};

const Header: FC<HeaderProps> = ({ title, description }) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const defaultUserImage =
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80";
  const userImage = loading ? defaultUserImage : session?.user?.image ?? defaultUserImage;

  return (
    <div className={clsx(styles.header, "flex")}>
      <div className={styles.leftHeader}>
        <div className={clsx(styles.leftContentPanel, styles.content)}>
          <h3 className="text-2xl font-black">{title}</h3>
          <p className="font-sans text-xs font-thin">{description}</p>
        </div>
      </div>
      <div className={styles.rightHeader}>
        <div className={clsx(styles.content, styles.rightContentPanel)}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative inline-block" type="button">
                <Image
                  className="inline-block h-12 w-12 rounded-lg object-cover"
                  src={userImage}
                  alt="Profile"
                  layout="intrinsic"
                  width={48}
                  height={48}
                />
                <span className="absolute bottom-0 right-0 -mr-1 inline-block h-3 w-3 rounded-full border-2 border-white bg-green-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full" align="end" side="bottom" sideOffset={6}>
              <DropdownMenuLabel className="w-48">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link className="w-full" href="./user-settings">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>GitHub</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem disabled>API</DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* <Menu.Item disabled>Delete my data</Menu.Item> */}
              {session ? (
                <DropdownMenuItem className="text-red-300" onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-green-300" onClick={() => signIn()}>
                  Sign in
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;
