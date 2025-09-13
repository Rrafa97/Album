declare module 'ali-oss' {
  interface OSSOptions {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    endpoint?: string;
  }

  interface PutObjectResult {
    name: string;
    url: string;
    res: {
      status: number;
      statusCode: number;
      headers: any;
    };
  }

  interface GetObjectResult {
    content: Buffer;
    res: {
      status: number;
      statusCode: number;
      headers: any;
    };
  }

  interface DeleteObjectResult {
    res: {
      status: number;
      statusCode: number;
      headers: any;
    };
  }

  class OSS {
    constructor(options: OSSOptions);
    put(name: string, file: any, options?: any): Promise<PutObjectResult>;
    get(name: string, options?: any): Promise<GetObjectResult>;
    delete(name: string, options?: any): Promise<DeleteObjectResult>;
    list(options?: any): Promise<any>;
    signatureUrl(name: string, options?: any): string;
    head(name: string, options?: any): Promise<any>;
    getBucketInfo(options?: any): Promise<any>;
  }

  export = OSS;
}
