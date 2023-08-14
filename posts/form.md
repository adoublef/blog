# Reducing 

## Introduction

If this is your first time visiting my site, here is where I discuss more on my development decisions when working on a project. I'm a fan of finding patterns, using patterns & learning patterns. Therefore, you are welcome to partake in a discussion related to the body of this blog.

## The `<form />` Element

In the typical web application there are going to be two places that need to be validated to mitigate risk: the client & the server.

The client, in our case the browser, has some built in validation that can be handled without JavaScript. This is handy for data that needs to be required, or needs to be a particular type of data (such as *email* or *number*). It can look something like this:

```html
<form action="/" method="post">
    <label htmlFor="foobar">Foobar</label>
    <input type="email" name="foobar" required />

    <input type="submit" value="Submit" />
</form>
```

Here, without any additional files we can enforce the rule that our input data `foobar` must both be required and is of type email. This is called **client-side validation**

There are limitations though. What if an email already exists. What if we had a size limit to which `foobar` could not exceed? This is usually where it's easier to implement client-side validation using JavaScript. There will be an assumption made now that the authoring is done using one of the various JavaScript frontend libraries. While it is doable without, the tools I will be exploring, do have more support when one is used. One such tool is [Zod](https://zod.dev/)

### Validating the frontend

As stated in the setup, we know that can author how html views using JavaScript library, enabling a better developer experiences than using the DOM APIs directly. Here we have a *React component* that renders an unstyled form with a single input element.

```jsx
const MyData = z.object({
  foobar: z.string().email(),
});

function MyForm() {
    const [foobar, setFoobar] = useState("")
    const [errors, setErrors] = useState()

    const submit = (evt) => {
        evt.preventDefault()

        const result = MyData.safeParse({ foobar })
        if (!result.success) {
            // ...handle error case
            setErrors(result.error)
        } else {
            // ...handle success case
            await fetch("www.example.com/submit", {
                method: "post",
                body: JSON.stringify(result.data)
            })
        }
    }

    return (
        <form onSubmit={submit}>
            <label htmlFor="foobar">Foobar</label>
            <input 
                type="email"
                name="foobar"
                required
                onChange={(e) => setUsername(e.target.value)}
            />
            {errors ? <ErrorSpan error={errors} /> : null}
            <input type="submit" value="Submit" />            
        </form>
    )
}
```

This is purposefully simple. Firstly, when looking for tutorials online, they tend to clump overwhelm the learner with styling, configuration files, extra dependencies, many fields to validate, etc, etc. This to me is a bit can take away from the main point of teh article and enforce ideas that the reader where not looking for such as styling. Secondly, I want to direct your attention to the `errors` object. This is incredibly useful to capture, allowing for much better accessibility to the end user. Returning this to the user means they have a better way of understanding why the action tried failed, and a hint on how to resolve this. It's fundamental that when authoring, to remember that accessibility improves the engagement of your app. When they feel they know how to use your tools, the greater chance of them returning.

Now that we have a basic form completed on our frontend, we need to send this back to the server.


### Validating the backend

The web is a bunch of browser clients, talking to servers, that interface some database. Database queries aren't common knowledge, so these servers map a lot of the complexity behind an endpoint ready for requesters to interact with. Essentially, a near enough definition to the term API (*Application Programming Interface*) & the wording here is deliberate. If we take a look at the following request

```http
POST /submit
Host: www.example.com
Accept: */*
Content-Type: application/json

'{ "foobar": "foobar@mail.co" }'
```

We are telling the server that we have some data that we want them to handle. The server will route this to the endpoint that handles all request to `www.example.com/submit` to which we as developers will do something and finally response back with what we have done. 

This leg of the user action can be implemented in various ways. Here we will use a *C#*. Reasons being that it's quite important to express how **big tech companies are able to have various languages communicate.** For beginners we are often urged to stick with a JavaScript metaframework like *NextJS* or *SvelteJS* but not every task works well in those. Sometimes you just need a separate backend hosted elsewhere. This is another assumption therefore that we will go with for now, but will circle back to this point [later](#).



```dotent
app.MapPost
```

---

## Resources

https://web.dev/learn/forms/validation/#why-should-you-validate-your-forms