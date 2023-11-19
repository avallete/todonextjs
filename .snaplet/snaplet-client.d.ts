type JsonPrimitive = null | number | string | boolean;
type Nested<V> = V | { [s: string]: V | Nested<V> } | Array<V | Nested<V>>;
type Json = Nested<JsonPrimitive>;

type ColumnValueCallbackContext = {
  /**
   * The seed of the field's model.
   *
   * \@example
   * ```ts
   * "<hash>/0/users/0"
   * ```
   */
  modelSeed: string;
  /**
   * The seed of the field.
   *
   * \@example
   * ```ts
   * "<hash>/0/users/0/email"
   * ```
   */
  seed: string;
};

/**
 * helper type to get the possible values of a scalar field
 */
type ColumnValue<T> = T | ((ctx: ColumnValueCallbackContext) => T);

/**
 * helper type to map a record of scalars to a record of ColumnValue
 */
type MapToColumnValue<T> = { [K in keyof T]: ColumnValue<T[K]> };

/**
 * Create an array of `n` models.
 *
 * Can be read as "Generate `model` times `n`".
 *
 * @param `n` The number of models to generate.
 * @param `callbackFn` The `x` function calls the `callbackFn` function one time for each element in the array.
 *
 * @example Generate 10 users:
 * ```ts
 * snaplet.users((x) => x(10));
 * ```
 *
 * @example Generate 3 projects with a specific name:
 * ```ts
 * snaplet.projects((x) => x(3, (index) => ({ name: `Project ${index}` })));
 * ```
 */
declare function xCallbackFn<T>(
  n: number | MinMaxOption,
  callbackFn?: (index: number) => T
): Array<T>;

type ChildCallbackInputs<T> = (
  x: typeof xCallbackFn<T>,
) => Array<T>;

/**
 * all the possible types for a child field
 */
type ChildInputs<T> = Array<T> | ChildCallbackInputs<T>;

/**
 * omit some keys TKeys from a child field
 * @example we remove ExecTask from the Snapshot child field values as we're coming from ExecTask
 * type ExecTaskChildrenInputs<TPath extends string[]> = {
 *   Snapshot: OmitChildInputs<SnapshotChildInputs<[...TPath, "Snapshot"]>, "ExecTask">;
 * };
 */
type OmitChildInputs<T, TKeys extends string> = T extends ChildCallbackInputs<
  infer U
>
  ? ChildCallbackInputs<Omit<U, TKeys>>
  : T extends Array<infer U>
  ? Array<Omit<U, TKeys>>
  : never;

type ConnectCallbackContext<TGraph, TPath extends string[]> = {
  /**
   * The branch of the current iteration for the relationship field.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#branch | documentation}.
   */
  branch: GetBranch<TGraph, TPath>;
  /**
   * The plan's graph.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#graph | documentation}.
   */
  graph: TGraph;
  /**
   * The index of the current iteration.
   */
  index: number;
  /**
   * The seed of the relationship field.
   */
  seed: string;
  /**
   * The plan's store.
   */
  store: Store;
};

/**
 * the callback function we can pass to a parent field to connect it to another model
 * @example
 * snaplet.Post({ User: (ctx) => ({ id: ctx.store.User[0] }) })
 */
type ConnectCallback<T, TGraph, TPath extends string[]> = (
  ctx: ConnectCallbackContext<TGraph, TPath>
) => T;

/**
 * compute the Graph type and the tracked path to pass to the connect callback
 */
type ParentCallbackInputs<T, TPath extends string[]> = TPath extends [
  infer TRoot,
  ...infer TRest extends string[],
]
  ? TRoot extends keyof Graph
    ? MergeGraphParts<Graph[TRoot]> extends infer TGraph
      ? ConnectCallback<T, TGraph, TRest>
      : never
    : never
  : never;

type ParentInputs<T, TPath extends string[]> =
  | T
  | ParentCallbackInputs<T, TPath>;

/**
 * omit some keys TKeys from a parent field
 * @example we remove Member from the Organization and User parent fields values as we're coming from Member
 * type MemberParentsInputs<TPath extends string[]> = {
 *   Organization: OmitParentInputs<OrganizationParentInputs<[...TPath, "Organization"]>, "Member", [...TPath, "Organization"]>;
 *   User: OmitParentInputs<UserParentInputs<[...TPath, "User"]>, "Member", [...TPath, "User"]>;
 * };
 */
type OmitParentInputs<
  T,
  TKeys extends string,
  TPath extends string[],
> = T extends ConnectCallback<infer U, any, any>
  ? ParentCallbackInputs<Omit<U, TKeys>, TPath>
  : Omit<T, TKeys>;

/**
 * compute the inputs type for a given model
 */
type Inputs<TScalars, TParents, TChildren> = Partial<
  MapToColumnValue<TScalars> & TParents & TChildren
>;

type OmitChildGraph<
  T extends Array<unknown>,
  TKeys extends string,
> = T extends Array<
  infer TGraph extends { Scalars: any; Parents: any; Children: any }
>
  ? Array<{
      Scalars: TGraph["Scalars"];
      Parents: TGraph["Parents"];
      Children: Omit<TGraph["Children"], TKeys>;
    }>
  : never;

type OmitParentGraph<
  T extends Array<unknown>,
  TKeys extends string,
> = T extends Array<
  infer TGraph extends { Scalars: any; Parents: any; Children: any }
>
  ? Array<{
      Scalars: TGraph["Scalars"];
      Parents: Omit<TGraph["Parents"], TKeys>;
      Children: TGraph["Children"];
    }>
  : never;

type UnwrapArray<T> = T extends Array<infer U> ? U : T;

type DeepUnwrapKeys<TGraph, TKeys extends any[]> = TKeys extends [
  infer THead,
  ...infer TTail,
]
  ? TTail extends any[]
    ? {
        [P in keyof TGraph]: P extends THead
          ? DeepUnwrapKeys<UnwrapArray<TGraph[P]>, TTail>
          : TGraph[P];
      }
    : TGraph
  : TGraph;

type GetBranch<T, K extends any[]> = T extends Array<infer U>
  ? DeepUnwrapKeys<U, K>
  : T;

type MergeGraphParts<T> = T extends Array<
  infer U extends { Scalars: unknown; Parents: unknown; Children: unknown }
>
  ? Array<
      U["Scalars"] & {
        [K in keyof U["Children"]]: MergeGraphParts<U["Children"][K]>;
      } & {
        [K in keyof U["Parents"]]: MergeGraphParts<
          U["Parents"][K]
        > extends Array<infer TParent>
          ? TParent
          : never;
      }
    >
  : never;

/**
 * the configurable map of models' generate and connect functions
 */
export type UserModels = {
  [KStore in keyof Store]?: Store[KStore] extends Array<
    infer TFields extends Record<string, any>
  >
    ? {
        connect?: (ctx: { store: Store }) => TFields;
        data?: Partial<MapToColumnValue<TFields>>;
      }
    : never;
};

type PlanOptions = {
  /**
   * Connect the missing relationships to one of the corresponding models in the store.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-autoconnect-option | documentation}.
   */
  autoConnect?: boolean;
  /**
   * Provide custom data generation and connect functions for this plan.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-autoconnect-option | documentation}.
   */
  models?: UserModels;
  /**
   * Pass a custom store instance to use for this plan.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#augmenting-external-data-with-createstore | documentation}.
   */
  store?: StoreInstance;
  /**
   * Use a custom seed for this plan.
   */
  seed?: string;
};

/**
 * the plan is extending PromiseLike so it can be awaited
 * @example
 * await snaplet.User({ name: "John" });
 */
export interface Plan extends PromiseLike<any> {
  generate: (initialStore?: Store) => Promise<Store>;
  /**
   * Compose multiple plans together, injecting the store of the previous plan into the next plan.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-pipe | documentation}.
   */
  pipe: Pipe;
  /**
   * Compose multiple plans together, without injecting the store of the previous plan into the next plan.
   * All stores stay independent and are merged together once all the plans are generated.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-merge | documentation}.
   */
  merge: Merge;
}

type Pipe = (plans: Plan[], options?: { models?: UserModels, seed?: string }) => Plan;

type Merge = (plans: Plan[], options?: { models?: UserModels, seed?: string }) => Plan;

type StoreInstance<T extends Partial<Store> = {}> = {
  _store: T;
  toSQL: () => string[];
};

type CreateStore = <T extends Partial<Store>>(
  initialData?: T,
  options?: { external: boolean },
) => StoreInstance<T>;
type Store = {
  _prisma_migrations: Array<_prisma_migrationsScalars>;
  todo: Array<todoScalars>;
  user: Array<userScalars>;
  vote: Array<voteScalars>;
};
type vote_valueEnum = "DOWNVOTE" | "UPVOTE";
type _prisma_migrationsScalars = {
  /**
   * Column `_prisma_migrations.id`.
   */
  id: string;
  /**
   * Column `_prisma_migrations.checksum`.
   */
  checksum: string;
  /**
   * Column `_prisma_migrations.finished_at`.
   */
  finished_at: string | null;
  /**
   * Column `_prisma_migrations.migration_name`.
   */
  migration_name: string;
  /**
   * Column `_prisma_migrations.logs`.
   */
  logs: string | null;
  /**
   * Column `_prisma_migrations.rolled_back_at`.
   */
  rolled_back_at: string | null;
  /**
   * Column `_prisma_migrations.started_at`.
   */
  started_at?: string;
  /**
   * Column `_prisma_migrations.applied_steps_count`.
   */
  applied_steps_count?: number;
}
type _prisma_migrationsParentsInputs<TPath extends string[]> = {

};
type _prisma_migrationsChildrenInputs<TPath extends string[]> = {

};
type _prisma_migrationsInputs<TPath extends string[]> = Inputs<
  _prisma_migrationsScalars,
  _prisma_migrationsParentsInputs<TPath>,
  _prisma_migrationsChildrenInputs<TPath>
>;
type _prisma_migrationsChildInputs<TPath extends string[]> = ChildInputs<_prisma_migrationsInputs<TPath>>;
type _prisma_migrationsParentInputs<TPath extends string[]> = ParentInputs<
_prisma_migrationsInputs<TPath>,
  TPath
>;
type todoScalars = {
  /**
   * Column `todo.id`.
   */
  id?: number;
  /**
   * Column `todo.text`.
   */
  text: string;
  /**
   * Column `todo.completed`.
   */
  completed?: boolean;
  /**
   * Column `todo.created_at`.
   */
  created_at?: string;
  /**
   * Column `todo.created_by_id`.
   */
  created_by_id: number;
}
type todoParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `todo` to table `user` through the column `todo.created_by_id`.
   */
  user: OmitParentInputs<userParentInputs<[...TPath, "user"]>, "todo", [...TPath, "user"]>;
};
type todoChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `todo` to table `vote` through the column `vote.todo_id`.
  */
  vote: OmitChildInputs<voteChildInputs<[...TPath, "vote"]>, "todo" | "todo_id">;
};
type todoInputs<TPath extends string[]> = Inputs<
  todoScalars,
  todoParentsInputs<TPath>,
  todoChildrenInputs<TPath>
>;
type todoChildInputs<TPath extends string[]> = ChildInputs<todoInputs<TPath>>;
type todoParentInputs<TPath extends string[]> = ParentInputs<
todoInputs<TPath>,
  TPath
>;
type userScalars = {
  /**
   * Column `user.id`.
   */
  id?: number;
  /**
   * Column `user.name`.
   */
  name: string;
  /**
   * Column `user.email`.
   */
  email: string;
  /**
   * Column `user.password`.
   */
  password: string;
  /**
   * Column `user.created_at`.
   */
  created_at?: string;
}
type userParentsInputs<TPath extends string[]> = {

};
type userChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `user` to table `todo` through the column `todo.created_by_id`.
  */
  todo: OmitChildInputs<todoChildInputs<[...TPath, "todo"]>, "user" | "created_by_id">;
  /**
  * Relationship from table `user` to table `vote` through the column `vote.created_by_id`.
  */
  vote: OmitChildInputs<voteChildInputs<[...TPath, "vote"]>, "user" | "created_by_id">;
};
type userInputs<TPath extends string[]> = Inputs<
  userScalars,
  userParentsInputs<TPath>,
  userChildrenInputs<TPath>
>;
type userChildInputs<TPath extends string[]> = ChildInputs<userInputs<TPath>>;
type userParentInputs<TPath extends string[]> = ParentInputs<
userInputs<TPath>,
  TPath
>;
type voteScalars = {
  /**
   * Column `vote.id`.
   */
  id?: number;
  /**
   * Column `vote.todo_id`.
   */
  todo_id: number;
  /**
   * Column `vote.value`.
   */
  value?: vote_valueEnum;
  /**
   * Column `vote.created_at`.
   */
  created_at?: string;
  /**
   * Column `vote.created_by_id`.
   */
  created_by_id: number;
}
type voteParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `vote` to table `todo` through the column `vote.todo_id`.
   */
  todo: OmitParentInputs<todoParentInputs<[...TPath, "todo"]>, "vote", [...TPath, "todo"]>;
  /**
   * Relationship from table `vote` to table `user` through the column `vote.created_by_id`.
   */
  user: OmitParentInputs<userParentInputs<[...TPath, "user"]>, "vote", [...TPath, "user"]>;
};
type voteChildrenInputs<TPath extends string[]> = {

};
type voteInputs<TPath extends string[]> = Inputs<
  voteScalars,
  voteParentsInputs<TPath>,
  voteChildrenInputs<TPath>
>;
type voteChildInputs<TPath extends string[]> = ChildInputs<voteInputs<TPath>>;
type voteParentInputs<TPath extends string[]> = ParentInputs<
voteInputs<TPath>,
  TPath
>;
type _prisma_migrationsParentsGraph = {

};
type _prisma_migrationsChildrenGraph = {

};
type _prisma_migrationsGraph = Array<{
  Scalars: _prisma_migrationsScalars;
  Parents: _prisma_migrationsParentsGraph;
  Children: _prisma_migrationsChildrenGraph;
}>;
type todoParentsGraph = {
 user: OmitChildGraph<userGraph, "todo">;
};
type todoChildrenGraph = {
 vote: OmitParentGraph<voteGraph, "todo">;
};
type todoGraph = Array<{
  Scalars: todoScalars;
  Parents: todoParentsGraph;
  Children: todoChildrenGraph;
}>;
type userParentsGraph = {

};
type userChildrenGraph = {
 todo: OmitParentGraph<todoGraph, "user">;
 vote: OmitParentGraph<voteGraph, "user">;
};
type userGraph = Array<{
  Scalars: userScalars;
  Parents: userParentsGraph;
  Children: userChildrenGraph;
}>;
type voteParentsGraph = {
 todo: OmitChildGraph<todoGraph, "vote">;
 user: OmitChildGraph<userGraph, "vote">;
};
type voteChildrenGraph = {

};
type voteGraph = Array<{
  Scalars: voteScalars;
  Parents: voteParentsGraph;
  Children: voteChildrenGraph;
}>;
type Graph = {
  _prisma_migrations: _prisma_migrationsGraph;
  todo: todoGraph;
  user: userGraph;
  vote: voteGraph;
};
type ScalarField = {
  name: string;
  type: string;
};
type ObjectField = ScalarField & {
  relationFromFields: string[];
  relationToFields: string[];
};
type Inflection = {
  modelName?: (name: string) => string;
  scalarField?: (field: ScalarField) => string;
  parentField?: (field: ObjectField, oppositeBaseNameMap: Record<string, string>) => string;
  childField?: (field: ObjectField, oppositeField: ObjectField, oppositeBaseNameMap: Record<string, string>) => string;
  oppositeBaseNameMap?: Record<string, string>;
};
type Override = {
  _prisma_migrations?: {
    name?: string;
    fields?: {
      id?: string;
      checksum?: string;
      finished_at?: string;
      migration_name?: string;
      logs?: string;
      rolled_back_at?: string;
      started_at?: string;
      applied_steps_count?: string;
    };
  }
  todo?: {
    name?: string;
    fields?: {
      id?: string;
      text?: string;
      completed?: string;
      created_at?: string;
      created_by_id?: string;
      user?: string;
      vote?: string;
    };
  }
  user?: {
    name?: string;
    fields?: {
      id?: string;
      name?: string;
      email?: string;
      password?: string;
      created_at?: string;
      todo?: string;
      vote?: string;
    };
  }
  vote?: {
    name?: string;
    fields?: {
      id?: string;
      todo_id?: string;
      value?: string;
      created_at?: string;
      created_by_id?: string;
      todo?: string;
      user?: string;
    };
  }}
export type Alias = {
  inflection?: Inflection | boolean;
  override?: Override;
};
export declare class SnapletClientBase {
  /**
   * Generate one or more `_prisma_migrations`.
   * @example With static inputs:
   * ```ts
   * snaplet._prisma_migrations([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet._prisma_migrations((x) => x(3));
   * snaplet._prisma_migrations((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet._prisma_migrations((x) => [{}, ...x(3), {}]);
   * ```
   */
  _prisma_migrations: (
    inputs: _prisma_migrationsChildInputs<["_prisma_migrations"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `todo`.
   * @example With static inputs:
   * ```ts
   * snaplet.todo([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.todo((x) => x(3));
   * snaplet.todo((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.todo((x) => [{}, ...x(3), {}]);
   * ```
   */
  todo: (
    inputs: todoChildInputs<["todo"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `user`.
   * @example With static inputs:
   * ```ts
   * snaplet.user([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.user((x) => x(3));
   * snaplet.user((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.user((x) => [{}, ...x(3), {}]);
   * ```
   */
  user: (
    inputs: userChildInputs<["user"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `vote`.
   * @example With static inputs:
   * ```ts
   * snaplet.vote([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.vote((x) => x(3));
   * snaplet.vote((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.vote((x) => [{}, ...x(3), {}]);
   * ```
   */
  vote: (
    inputs: voteChildInputs<["vote"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Compose multiple plans together, injecting the store of the previous plan into the next plan.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-pipe | documentation}.
   */
  $pipe: Pipe;
  /**
   * Compose multiple plans together, without injecting the store of the previous plan into the next plan.
   * All stores stay independent and are merged together once all the plans are generated.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-merge | documentation}.
   */
  $merge: Merge;
  /**
   * Create a store instance.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#augmenting-external-data-with-createstore | documentation}.
   */
  $createStore: CreateStore;
};

export type SnapletClientBaseOptions = {
  userModels?: UserModels
}


type PgClient = {
  query(string): Promise<unknown>
}

export declare class SnapletClient extends SnapletClientBase {
  constructor(pgClient: PgClient, options?: SnapletClientBaseOptions)
}