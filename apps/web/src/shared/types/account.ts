export default interface Account {
    id: string;
    name: string;
    email: string;
    role: "CASHIER" | "COOK" ;
    password?: string;
    // status: "active" | "inactive";
    // joined: string;
}