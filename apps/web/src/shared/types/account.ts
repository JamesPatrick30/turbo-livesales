export default interface Account {
    id: string;
    name: string;
    email: string;
    role: "cashier" | "cook" ;
    password?: string;
    // status: "active" | "inactive";
    // joined: string;
}