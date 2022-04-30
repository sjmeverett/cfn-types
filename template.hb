import { createResource, Resource } from './util';
export * from './util';

{{#each propertyTypes}}
/**
 * The `{{type}}` property type.
 * @see {{documentation}}
 */
export interface {{name}} {
  {{#each properties}}
  /**
    * @see {{documentation}}
    */
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/each}}
}

{{/each}}

{{#each attributeTypes}}
/**
 * Attributes for the `{{type}}` resource type.
 */
export interface {{name}}Attributes {
  {{#each properties}}
  "{{name}}"{{#if optional}}?{{/if}}: {{type}};
  {{/each}}
}
{{/each}}

{{#each resourceTypes}}
/**
 * Properties for the `{{type}}` resource type.
 * @see {{documentation}}
 */
export interface {{name}}Properties {
  {{#each properties}}
  /**
    * @see {{documentation}}
    */
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/each}}
}

/**
 * Creates a `{{type}}` resource.
 */
export function create{{name}}(
  name: string,
  properties: {{name}}Properties
): {{name}}Description {
  return createResource("{{type}}", name, properties);
}

export type {{name}}Description = Resource<"{{type}}", {{name}}Properties, {{name}}Attributes>;

{{/each}}
