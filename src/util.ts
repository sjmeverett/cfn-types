import type { Readable } from 'stream';

/**
 * Represents a CloudFormation resource.
 */
export interface Resource<
  TType extends string = any,
  TProps = unknown,
  // just a marker type
  _TAttributes = unknown,
> {
  kind: 'resource';
  name: string;
  type: TType;
  properties: TProps;
  dependsOn?: string[];
}

/**
 * Utility function to create a resource.
 * @param type the type of CloudFormation resource
 * @param name the name of the resource
 * @param properties the properties of the resource
 * @returns the resource definition object
 */
export function createResource<TType extends string, TProps, TAttributes>(
  type: TType,
  name: string,
  properties: TProps,
): Resource<TType, TProps, TAttributes> {
  return { kind: 'resource', name, type, properties };
}

/**
 * Declares that the resource is dependent on one or more other resources.
 * @param resource The resource to add dependencies to
 * @param dependencies The resource(s) on which the resource is dependent
 */
export function dependsOn(
  resource: Resource<any, unknown, unknown>,
  ...dependencies: Resource<any, unknown, unknown>[]
) {
  if (!resource.dependsOn) resource.dependsOn = [];
  resource.dependsOn.push(...dependencies.map((x) => x.name));
}

/**
 * Returns the ref for a resource.
 * @param resource
 */
export function getRef(resource: Resource<any, unknown, unknown>): string {
  return { Ref: resource.name } as any;
}

/**
 * Gets the attribute value.
 * @param resource The resource to get the attribute for.
 * @param name The name of the attribute to get.
 */
export function getAttribute<TAttributes, TName extends keyof TAttributes>(
  resource: Resource<any, any, TAttributes>,
  name: TName,
): TAttributes[TName] {
  return { 'Fn::GetAtt': [resource.name, name] } as any;
}

/**
 * Returns true if the given object is a resource.
 * @param arg the object to test
 */
export function isResource(
  arg: any,
): arg is Resource<string, unknown, unknown> {
  return arg?.kind === 'resource';
}

export function fnSub(str: string, vars?: Record<string, string>): string {
  return { 'Fn::Sub': vars ? [str, vars] : str } as any;
}

export type AssetBody = Buffer | Uint8Array | Blob | string | Readable;

/**
 * Represents an asset to be uploaded to S3.
 */
export interface Asset {
  kind: 'asset';
  key: string;
  body: AssetBody;
}

/**
 * Creates an uploadable asset description.
 * @param key the path on S3 for the asset
 * @param body the contents of the asset, or a function that creates the contents
 */
export function createAsset(
  key: string,
  body: AssetBody | (() => AssetBody),
): Asset {
  return typeof body === 'function'
    ? {
        kind: 'asset',
        key,
        get body() {
          return body();
        },
      }
    : {
        kind: 'asset',
        key,
        body,
      };
}

/**
 * Returns true if the given object is an asset.
 * @param obj the object to test
 */
export function isAsset(obj: any): obj is Asset {
  return obj?.kind === 'asset';
}

export type StackItem = Resource | Asset;

/**
 * Gets the Resources map for your CloudFormation template from an array of resources.
 * @param stack the resources that make up the template, as created by any `create...` function
 */
export function getResources(stack: StackItem[]) {
  const obj = {} as Record<
    string,
    { Type: string; Properties: any; DependsOn?: string[] }
  >;

  stack.filter(isResource).forEach((resource) => {
    obj[resource.name] = getResource(resource);
  });

  return obj;
}

/**
 * Formats a resource object as CloudFormation resource.
 * @param resource the resource object to format
 * @returns an object with the same structure as a CloudFormation resource
 */
export function getResource(resource: Resource) {
  return {
    Type: resource.type,
    Properties: resource.properties,
    DependsOn: resource.dependsOn,
  };
}

/**
 * Gets the deduplicated assets from an array of stack items.
 * @param stack the array of stack items
 * @returns only the assets, deduplicated by key
 */
export function getAssets(stack: StackItem[]) {
  return uniqBy(stack.filter(isAsset), (x) => x.key);
}

function uniqBy<T>(items: T[], predicate: (item: T) => string) {
  const result: Record<string, T> = {};

  items.forEach((item) => {
    result[predicate(item)] = item;
  });

  return Object.values(result);
}

/**
 * Gets the CloudFormation JSON for a given set of resources
 * @param stack the set of resources to generate JSON for
 * @returns the CloudFormation JSON as a string
 */
export function getTemplate(stack: StackItem[]) {
  return JSON.stringify(
    {
      AWSTemplateFormatVersion: '2010-09-09',
      Resources: getResources(stack),
    },
    null,
    2,
  );
}
