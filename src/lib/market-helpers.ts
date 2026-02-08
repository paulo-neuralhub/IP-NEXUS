/**
 * IP-Market fee calculation helpers
 */

export interface FeeBreakdown {
  professionalFees: number;
  officialFees: number;
  platformFeeSeller: number;
  platformFeeBuyer: number;
  totalBuyerPays: number;
  totalSellerReceives: number;
  totalPlatformRevenue: number;
}

export function calculateFees(
  professionalFees: number,
  officialFees: number,
  sellerFeePercent = 10,
  buyerFeePercent = 5
): FeeBreakdown {
  const platformFeeSeller = professionalFees * (sellerFeePercent / 100);
  const platformFeeBuyer = professionalFees * (buyerFeePercent / 100);
  const totalBuyerPays = professionalFees + officialFees + platformFeeBuyer;
  const totalSellerReceives = professionalFees - platformFeeSeller;
  const totalPlatformRevenue = platformFeeSeller + platformFeeBuyer;

  return {
    professionalFees,
    officialFees,
    platformFeeSeller,
    platformFeeBuyer,
    totalBuyerPays,
    totalSellerReceives,
    totalPlatformRevenue,
  };
}
