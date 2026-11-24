# The content of the site

What the team changes most often lives here, as data, and is edited on the admin page of the site:
**www.ben.events/admin**.

| File | What it holds | Shown on |
|---|---|---|
| `projects.json` | the portfolio: each project, its photos and facts; the kinds of events and the places | home page, /projects, each project's page, the pages of the cities and the events |
| `blog/<id>.json` | one article of the blog each | /blog, each article |
| `voices.json` | key figures and client quotes | home page (under the client logos), /agency |

Each save on the admin page is a commit to this repository, signed with the name of the person who made it.
Vercel then builds the site again (`node tools/site/build.mjs && node tools/site/dist.mjs`, set in `vercel.json`) and puts it online,
about a minute later. A project or an article marked **draft** stays off the site.

These files are not published: Vercel builds the site and publishes only `dist/` (`tools/site/dist.mjs`),
without `content/`, `tools/` or `api/`. Anyone who can read this repository can read them, drafts included:
keep the repository private.

## Setting up the admin

In the Vercel project of the site, **Settings → Environment Variables**, then a new deployment:

- `ADMIN_USERS`: who may sign in, one person per line (or separated by `;`), as `Name:password`.
  Every password needs at least 12 characters. Remove a line to remove a person.
- `GITHUB_TOKEN`: a GitHub *fine-grained personal access token* for this repository only, with the
  permission **Contents: Read and write**.

Changing either one signs everyone out.

## What the admin does not change

The texts of the home page, the services, the kinds of events, the cities and the agency page are in code
(`index.html`, `assets/js/i18n.js`, `assets/js/services.js`, `tools/site/events.mjs`, `tools/site/pages.mjs`).
Photos uploaded on the admin page are resized and compressed in the browser and written to
`assets/img/projects/<id>/` and `assets/img/blog/`, with their lighter copies (`assets/img/_w/`) and
their link previews (`assets/img/og/`).
