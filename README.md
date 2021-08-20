# brr

brr is a hobby programming language that is built in Deno. The project as a
whole is purely a learning experience.

## Usage

The following is a sample `brr` file:

`main.brr`

```
let a 10 ;
let b mul 5 4 ;

println add add a b 12 ;
```

Execute the file by running `brr` and passing the file's name as an argument:

```bash
./brr main.brr
```

Output:

```
42
```

## Installation

### Required Build Tools

- [git](https://git-scm.com/downloads)
- [make](https://www.gnu.org/software/make/)

### Dependencies

- [Deno](https://github.com/denoland/deno)

After installing the required build tools and dependencies, `brr` can be
installed by running the following commands:

```bash
git clone https://github.com/thismarvin/brr.git
cd brr
make
```

`brr` will be packaged to `./bin`.
