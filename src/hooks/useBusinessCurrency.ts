import { useQuery } from "@apollo/client/react";
import { MY_ACCESS } from "../lib/apollo";
import {
  currencySymbol,
  formatMoneyMajor,
  type CurrencyCode,
} from "../utils/money";

type AccessData = {
  business?: { currency?: CurrencyCode };
};

export function useBusinessCurrency() {
  const { data } = useQuery<AccessData>(MY_ACCESS);
  const currency: CurrencyCode = data?.business?.currency ?? "GHS";
  return {
    currency,
    symbol: currencySymbol(currency),
    formatMoney: (major: number) => formatMoneyMajor(major, currency),
  };
}
