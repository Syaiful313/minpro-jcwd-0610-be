export interface TransactionFrontend{
    details: {ticketTypeId: number, quantity: number}[]
    usePoints?: boolean
    voucherCode?: string;
    couponCode?: string;
}