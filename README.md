# @sjmeverett/cfn-types

CloudFormation in typescript instead of JSON/YAML.

## Why?

CloudFormation is overwhelming at first, so I thought I'd make it a little easier. Because there are types, you get editor completion, and there are links to the AWS documentation in the JSDocs. Because it's just TypeScript, you can generate the resource descriptions however you like, and break your stack into separate files.

You also get expressions, conditionals, etc, and you can create NPM modules with reusable patterns.

## How?

```typescript
import { createLambdaFunction, getTemplate } from '@sjmeverett/cfn-types';

const fn = createLambdaFunction('MyLambdaFunction', {
  FunctionName: '...',
  // ... etc
});

const stack = [fn];

console.log(getTemplate(stack));
```

The library defines a function for every CloudFormation resource type, generated by trimming the `AWS::` off the front and removing other `::` in the name. E.g., `AWS::Lambda::Function` becomes `createLambdaFunction`.

The `create` functions accept two parameters: the resource name, and an appropriately-typed `Properties` definition. They return an object which can be formatted as the CloudFormation resource object by `getResources`.

There are a few helper methods as well:

- `dependsOn(resource, ...dependencies)` — adds resources to the `DependsOn` field of the specified resource
- `getRef(resource)` — just returns `{ Ref: getName(resource) }`
- `getAttribute(resource, attributeName)` — gets an attribute (output) from the specified resource, in a typesafe manner
- `getResources(resources)` — builds up the map of resource name to resource definition from an array of resources
- `fnSub(str: string, vars?: Record<string, string>)` — helper for `Fn::Sub` intrinsic function

Note that the types returned from `getRef` and `getAttribute` are "faked". `getRef` claims to return a string, even though it returns an object like `{Ref: 'foo'}`, and `getAttribute` claims to return whatever the type of the attribute you asked for, even though it actually returns `{'Fn::GetAtt': 'foo'}`. I figured this was more useful, as it means you can supply an attribute value to a Property with the matching type.

## How does it work?

The build process downloads a JSON file from AWS that describes all the AWS CloudFormation types, generates a Typescript file from a handlebars template, and then compiles that Typescript.
