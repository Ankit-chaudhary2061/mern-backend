

export interface OrderData{
    phoneNumber:string,
    totalAmount:number, 
    shippingAddress:string,
    paymentDetails:{
        paymentMethod:PaymentMethod,
        paymentStatus?:PaymentStatus,
        pidx?:string
    },
    items:OrderDetails[]
}

export interface OrderDetails{
    quantity:number,
    productId :string
} 
export enum PaymentMethod{
    COD = 'cod',
    ESEWA = 'esewa',
    KHALTI='khalti' 
}

export enum PaymentStatus{
     UNPAID = 'unpaid',
    PAID = 'paid'
}
export interface KhaltiResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
  user_fee?: number;
}

export interface TransactionVerificationResponse{
    pidx:string,
    total_amount:number,
    status:TransactionStatus,
    transaction_id:string,
    fee:number,
    refunded:boolean

}

export enum TransactionStatus{
    COMPLETED = 'Completed',
    PENDING = 'Pending',
    REFUNDED = 'Refunded',
    INITIATED = 'Initiated'
}
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CANCELED = 'cancelled',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}
