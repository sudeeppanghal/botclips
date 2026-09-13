export interface SmmProviderService {
  service: string | number;
  name: string;
  type: string;
  category: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  dripfeed?: boolean | string | number;
  refill?: boolean | string | number;
  cancel?: boolean | string | number;
}

export interface SmmAddOrderResponse {
  order?: string | number;
  error?: string;
}

export interface SmmOrderStatusResponse {
  charge?: string | number;
  start_count?: string | number;
  status?: string;
  remains?: string | number;
  currency?: string;
  error?: string;
}

export interface SmmBalanceResponse {
  balance?: string | number;
  currency?: string;
  error?: string;
}

export class SmmPanelClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async post(params: Record<string, any>): Promise<any> {
    const formData = new URLSearchParams();
    formData.append("key", this.apiKey);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        formData.append(k, String(v));
      }
    }

    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "DhillonSMM-Client/1.0",
      },
      body: formData.toString(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Provider API HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  }

  /** Fetch all available services from the upstream provider */
  async getServices(): Promise<SmmProviderService[]> {
    const res = await this.post({ action: "services" });
    if (Array.isArray(res)) {
      return res;
    }
    if (res && res.error) {
      throw new Error(res.error);
    }
    return [];
  }

  /** Check current account balance in upstream panel */
  async getBalance(): Promise<SmmBalanceResponse> {
    return await this.post({ action: "balance" });
  }

  /** Place a new order with upstream provider */
  async addOrder(params: {
    serviceId: string | number;
    link: string;
    quantity: number;
    runs?: number;
    interval?: number;
    comments?: string;
  }): Promise<SmmAddOrderResponse> {
    const payload: Record<string, any> = {
      action: "add",
      service: params.serviceId,
      link: params.link,
      quantity: params.quantity,
    };

    if (params.runs && params.runs > 1) {
      payload.runs = params.runs;
      payload.interval = params.interval || 60;
    }

    if (params.comments) {
      payload.comments = params.comments;
    }

    return await this.post(payload);
  }

  /** Fetch status for a single order */
  async getOrderStatus(orderId: string | number): Promise<SmmOrderStatusResponse> {
    return await this.post({ action: "status", order: orderId });
  }

  /** Fetch status for multiple orders comma-separated */
  async getMultipleOrderStatus(orderIds: (string | number)[]): Promise<Record<string, SmmOrderStatusResponse>> {
    return await this.post({ action: "status", orders: orderIds.join(",") });
  }
}
