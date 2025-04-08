import React, { ReactNode } from "react";

type Props = {
  name: string;
  buttonComponent?: ReactNode;
  isSmallText?: boolean;
};

const Header = ({ name, buttonComponent, isSmallText = false }: Props) => {
  return (
    <div className="mb-5 flex w-full items-center justify-between gap-20">
      <h1
        className={`${isSmallText ? "text-lg" : "text-2xl"} font-semibold dark:text-white`}
      >
        {name}
      </h1>
      <div className="flex items-center justify-center gap-10">
        {buttonComponent}
      </div>
    </div>
  );
};

export default Header;
