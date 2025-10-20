import { httpClient } from "@/configs/axios";

class Customer {
    async getCustomerProfile(id: string) {
        return await httpClient.get(`/customer/${id}`);
    }
}

export const customer = new Customer();