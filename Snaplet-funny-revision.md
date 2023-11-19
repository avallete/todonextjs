## Declarative Seeding with Snaplet Generate:

### Why Are We Here Again?
Let's talk about `snaplet generate` - our latest creation that's as revolutionary as coffee in a programmer's life. It's like the Swiss Army knife for seeding databases, but instead of knives and screwdrivers, it's packed with Typescript goodness. By the end of this post, you'll not only be ready to spin up your dev environments with `snaplet generate`, but you might also crack a smile or two!

### Our Game Plan
Imagine a simple todo app (source code [here](https://github.com/avallete/todonextjs) - as basic as 'Hello World' but slightly more fun. This will be our playground to showcase the awesomeness of `snaplet generate`.

### Back to the Basics - But Keep It Snappy!
We start with a todo app so simple, even my pet rock could use it. Here's the Prisma schema:

```ts
model todo {
  id         Int      @id @default(autoincrement())
  text       String
  completed  Boolean  @default(false)
  created_at DateTime @default(now()) @db.Timestamp(6)
}
```

And our database ERD looks something like this:

![basic ERD schema](https://github.com/avallete/todonextjs/assets/8771783/097fce2f-9732-412e-bd30-d3cc76d96504)

With our app, including the classic CRUD endpoints, we're set faster than you can say "JavaScript".

![todo app demo](https://github.com/avallete/todonextjs/assets/8771783/5896b6a7-7bb1-4bf1-8a85-b125c0177a83)

Now, imagine you need a bazillion todos to test your app. You could write individual insert statements, but let's face it, we'd rather watch paint dry. Enter `snaplet generate`.

### Snaplet's Superpowers

1. **Introspection Extraordinaire:** First, it peeks into your database like a detective, gathering all the juicy details.
2. **Declarative Delight:** Next, you get a fancy `snaplet.config.ts` file to declare your seeding dreams.

Setting it up is easier than forgetting to mute yourself on a Zoom call:

```bash
npx snaplet setup
```

And voilà, a `snaplet.config.ts` file appears:

```ts
import { copycat, faker } from "@snaplet/copycat";
import { defineConfig } from "snaplet";
copycat.setHashKey("yHiTMIO7lhhnEoPX");
export default defineConfig({
  generate: {
    async run(snaplet) {
      await snaplet.todo((x) => x(2));
    },
  },
});
```

![setup cli run](https://github.com/avallete/todonextjs/assets/8771783/9805bdcf-7008-45ae-b91b-a6f75f3d5ef5)

Want 20 todos? Just tweak the `snaplet.todo` line. It's like ordering pizza, but for data:

```ts
// x stand for the algebric "times" operator
// So this read like "create a todo x 20"
await snaplet.todo((x) => x(20));
```

A simple command later, your database is as populated as a concert pre-COVID:

```bash
npx snaplet generate
```

![data generation run](https://github.com/avallete/todonextjs/assets/8771783/e1ecf3b9-7cd8-41c2-a7e4-84c36c1f5fbc)

Curious about the SQL magic? Just run `npx snaplet generate --sql` and marvel at the queries, as eloquent as Shakespeare (if he coded):


```sql
INSERT INTO public.todo (id,text,completed,created_at) VALUES
(1, 'Acesto orum ad nullam de aris ut, efficiantur imad ab laetam si nobis exmultamen esse.', DEFAULT, DEFAULT),
(2, 'Potiorem homin contra concordant conquis.', DEFAULT, DEFAULT),
(3, 'Omi quid satiabilit quoddam venire appetenim a.', DEFAULT, DEFAULT),
(4, 'Potest praesid ex gendos ant, scientia solum epicet suo etiam qui dicta.', DEFAULT, DEFAULT),
(5, 'Et responender se e physicis nullo summum, ere quae et vero timumquam sent quibusu.', DEFAULT, DEFAULT),
(6, 'Ut video mihi maxime alest, unum habet aut minimpedien consequantur congressuscip.', DEFAULT, DEFAULT),
(7, 'Expeten domo tum parta inum saepe, dignitione de a liberos tum se homo qua.', DEFAULT, DEFAULT),
(8, 'Homere nobis ex voluptate mihi possit vero, inclusae a gymnasia as poteramic ut vita.', DEFAULT, DEFAULT),
(9, 'Homin delectatem et quam as desis.', DEFAULT, DEFAULT),
(10, 'Inum torem nec vire dubio mihi illum per.', DEFAULT, DEFAULT),
(11, 'Et rerum deorum dialectet orteat.', DEFAULT, DEFAULT),
(12, 'Delecce perangore multi et illud, publictorquat is magisse ipsas referin neque sive.', DEFAULT, DEFAULT),
(13, 'Siculassum eturus modum missimo iud quantum inis.', DEFAULT, DEFAULT),
(14, 'Nihillo cohaeres aperta probartemper sunt.', DEFAULT, DEFAULT),
(15, 'Quaedamicar recoristun neque a esse perspicuum.', DEFAULT, DEFAULT),
(16, 'Quam repugientiam neque es enim tamentur provinandum, nobisse hominesse sublatincur eosque et corpus consequi itur.', DEFAULT, DEFAULT),
(17, 'Sit totellatin bonae has et albucius diu efficerit, quidam gravisse si m nondum.', DEFAULT, DEFAULT),
(18, 'Posse si erunturben a quibus enda necesse tem, desid in nec undia satiabillus afferre.', DEFAULT, DEFAULT),
(19, 'Hac paulo a et est falsariam verbum sic, esse monstruosi idua aut debilitur non mediocritud haec.', DEFAULT, DEFAULT),
(20, 'Ident fruuntur noscertae et proptervalet neque es.', DEFAULT, DEFAULT);
```

### When Change is the Only Constant
Say your app needs an upgrade, like adding social media to a phone - suddenly, it's a whole new world. Now, todos need users and votes, because everything's better with a bit of competition.

Here's the new and improved schema:

```ts
model user {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  created_at DateTime @default(now()) @db.Timestamp(6)
  todos     todo[]
  votes     vote[]
}

model todo {
  id         Int      @id @default(autoincrement())
  text       String
  completed  Boolean  @default(false)
  created_at DateTime @default(now()) @db.Timestamp(6)
  created_by_id Int
  created_by user     @relation(fields: [created_by_id], references: [id])
  votes      vote[]
}

enum vote_value {
  UPVOTE
  DOWNVOTE
}

model vote {
  id        Int      @id @default(autoincrement())
  todo_id   Int
  todo      todo     @relation(fields: [todo_id], references: [id])      
  value     vote_value @default(UPVOTE)
  created_at DateTime @default(now()) @db.Timestamp(6)
  created_by_id Int
  created_by user     @relation(fields: [created_by_id], references: [id])
}
```

Our ERD schema now has more relationships than a soap opera:

![updated ERD schema](https://github.com/avallete/todonextjs/assets/8771783/06156217-8c3c-4ad1-a949-1a3e6cd434e3)

For our upgraded app, we need:

1. Five users - think Avengers, but for todos.
2. Twenty todos - each hero gets four.
3. Votes - because everyone's opinion matters.

With `snaplet`, updating the config is like a smooth dance move:

```ts
export default defineConfig({
  generate: {
    async run(snaplet) {
      // 1. snaplet.$pipe allow to link two "generates" sections togethers
      await snaplet.$pipe([
        // 2. We create our first 5 initials users
        snaplet.user((x) => x(5)),
        // 3. We want to create 20 todos
        snaplet.todo((x) => x(20, () => ({
          vote: (x) => x(
            // 5. For each todo, we want to create 5 votes
            5, () => ({
              // 6. Each vote value should be either an upvote or a downvote
              value: ({seed}) => copycat.oneOf(seed, ["UPVOTE" as const, "DOWNVOTE" as const])
            })
          )})),
	      // 4. By using this option we're telling:
	      // "generated data should try to connect with existing data rather than create new one"
	      // Since we already created 5 users, everything related to "users" in our todo will pick
	      // and connect with one of them for each created todo
          {autoConnect: true}
        )
	  ]) 
    },
  },
});
```

This method saves you from script-writing marathons, proving that at Snaplet, we turn the tedious into the terrific.

### Acknowledgments with a Twist
A hat tip to David Li, whose original post was the Alfred to my Batman in crafting this narrative: [David Li's Original Post](https://friendlyuser.github.io/posts/tech/js/nextjs_todo_list_neon/).
