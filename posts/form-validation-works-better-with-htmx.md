---
title: Form Validation works better with Htmx
publish_date: 2023-08-15
---

If this is your first time visiting my site, here is where I discuss more on my development decisions when working on a project. I'm a fan of finding patterns, using patterns & learning patterns. Therefore, you are welcome to partake in a discussion related to the body of this blog.

## The `<form />` Element

In the typical web application there are going to be two places that need to be validated to mitigate risk: the client & the server. <!--  --> Our example will allow users to signup to use our services. Included in the form will be:

- An *email address* that adheres to the syntax as specified by **RFC 5322** and extended by **RFC 6532**

- A *secure password* that will need to be challenging enough that cannot be easily guessable

- A *bio* that will be shown in the users homepage. This is entirely optional

Though nowadays, it's strongly encouraged to outsource this task to a 3rd party authentication service, we are just highlighting a potential usecase. After reading this article, let your imagination run. 

### HTML Validation

The client, in our case the browser, has some built in validation that can be handled without JavaScript. This is handy for data that needs to be required, or needs to be a particular type of data (such as *email* or *number*). It can look something like this:

```html
<form action="/" method="post">
  <label htmlFor="email">
    <span>Email</span>
    <input type="email" name="email" required>
  </label>
  <label htmlFor="password">
    <span>Password</span>
    <input type="text" name="password" required>
  </label>
  <label htmlFor="bio">
    <span>Bio</span>
    <textarea type="text" name="bio"></textarea>
  </label>
  <input type="submit" value="Submit">
</form>
```

Here, without any additional files we can enforce rules that our input data must follow.

There are limitations though. What if an email already exists? What if the password is not string enough? This is usually where JavaScript gives it's first handout to improve the developer experience of creating validation rules. 

There will be an assumption made now that the authoring is done using one of the various JavaScript frontend libraries. While it is do-able without, the tools I will be exploring, do have more support when a frontend library is used. One such tool I'll be focusing on is [Zod](https://zod.dev/)

### Validating the frontend with JavaScript 

As stated in the setup, we know that can author how html views using JavaScript library, enabling a better developer experiences than using the DOM APIs directly. Here we have a *React component* that renders an unstyled form with a single input element.

```js
const User = z.object({
  email: z.string().email(),
  password: z.string()min(6).max(20).refine(passwordRegex),
  bio: z.string().optional(),
});

function MyForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [errors, setErrors] = useState()

  const submit = (evt) => {
    evt.preventDefault()

    const result = User.safeParse({ email, password, bio })
    if (!result.success) {
      // ...handle error case
      setErrors(result.error)
    } else {
      // ...handle success case
      await fetch("api.example.com/", {
        method: "post",
        body: JSON.stringify(result.data)
      })
    }
  }

  return (
    <form onSubmit={submit}>
      {errors ? <output>{errors.toString()}</output> /> : null}
      <label htmlFor="email">
        <span>Email</span>
        <input type="email" name="email" required
          onChange={(e) => setEmail(e.target.value)}
        >
      </label>
      <label htmlFor="password">
          <span>Password</span>
          <input type="password" name="password" required
              onChange={(e) => setPassword(e.target.value)}
          >
      </label>
      <label htmlFor="bio">
        <span>Bio</span>
        <textarea type="text" name="bio"
            onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </label>
      <input type="submit" value="Submit" />           
    </form>
  )
}
```

This is purposefully simple. Firstly, when looking for tutorials online, they tend to clump overwhelm the learner with styling, configuration files, extra dependencies, many fields to validate, etc, etc. This to me is a bit can take away from the main point of teh article and enforce ideas that the reader where not looking for such as styling. Secondly, I want to direct your attention to the `errors` object. This is incredibly useful to capture, allowing for much better accessibility to the end user. Returning this to the user means they have a better way of understanding why the action tried failed, and a hint on how to resolve this. It's fundamental that when authoring, to remember that accessibility improves the engagement of your app. When they feel they know how to use your tools, the greater chance of them returning.

Now that we have a basic form completed on our frontend, we need to send this back to the server.


### Protecting the server from bad actors

The web is a bunch of browser clients, talking to servers, that interface some database. Database queries aren't common knowledge, so these servers map a lot of the complexity behind an endpoint ready for requesters to interact with. Essentially, a near enough definition to the term API (*Application Programming Interface*) & the wording here is deliberate. If we take a look at the following request

```http
POST /
Host: api.example.com
Accept: */*
Content-Type: application/json

'{ "email": "foobar@mail.com", "password": "g!tHu6", "bio": "My name is foobar" }'
```

We are telling the server that we have some data that we want them to handle. The server will route this to the endpoint that handles all request to `www.example.com` to which we as developers will do something and finally response back with what we have done. 

This leg of the user action can be implemented in various ways. Here we will use a *C#*. Reasons being that it's quite important to express how **big tech companies are able to have various languages communicate.** For beginners we are often urged to stick with a JavaScript metaframework like *NextJS* or *SvelteJS* but not every task works well in those. Sometimes you just need a separate backend hosted elsewhere. This is another assumption therefore that we will go with for now, but will circle back to this point [later](#so-what-is-the-problem).


```csharp
public class User
{
  public string Email { get; set; }
  // custom value object for password validation
  public Password Password { get; set; }
  public string? Bio { get; set; }
};

var app = builder.Build();

// validation baked into .NET
app.MapPost("/", async (User user, UserDb db) =>
{
  // check if email already exist
  if ((await db.Users.Where(u => u.Email == user.Email)) is not null)
  {
    return Results.Conflict();
  };
  
  db.Users.Add(user);
  await db.SaveChangesAsync();

  return Results.Create($"/{user.Id}", user);
});
```

Nothing here should be *too* controversial. We define a class for the body that will be included on the request called `User`. Essentially the same schema that is represented on the frontend. One key difference however is that in CSharp we can define custom value objects to use over primitives. Now if the body is valid, the type of `User.Password` will be a stronger type.

In addition, we have the logic to check if the email already exists & return an error if so, else save to the database and return a `201`. 

## So what is the problem?

Well, it's not obvious from the snippets but its the extra cognitive effort it takes to maintain both the frontend and backend. It's popular to separate these two concerns allowing teams to exhaust their expertise in the areas they are strongest with, regrouping when either side needs a change to the schema. The other benefit is that the server is not imposing how clients decides to use the response data. Here we return the user as a json body, to be consumed however they feel.

However, this flexibility and no real ownership leads requires a large amount of discipline amongst teams. A new feature may need a pair of developers to resolve from either side of the stack. It can get messy and if you are a solo developer, the context switching can be a burden. I think this is where you may prefer to use a single language for the full-stack & given that the browser's scripting language of choice is JavaScript, we see metaframeworks like *NextJS*, *SolidStart* & *SvelteKit* be very favourable. This has it's own qualms. We are now tied into JavaScript everywhere. There aer many arguments online regarding the fact most teams won't ever see the bottleneck of JavaScript, and this may be true but what if you just have a better development experience on the backend with another language like *CSharp, Go or Python*. You're comfortable with your type system, your tooling, your ecosystem. We still need to make a frontend but can we do this without the context switching, the addition complexity of maintaining two applications for one website?

Well, there is a solution for those developers, and it's called HTMX. 

## Let's strategies