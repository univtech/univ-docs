// WebWorker信息
export interface WebWorkerMessage {
    // 信息类型
    type: string;
    // 信息id
    id?: number;
    // 有效负载
    payload: any;
}
