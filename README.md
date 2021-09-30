# Developer Challenge

We would like you to create a simple program to help us manage books at a library. The program should allow us to write a script that interacts with the copies of books and check the stock at the end.

We are not looking for anything clever here, just an example of how you use your chosen programming language to solve a simple problem and how you organize your code.

## 1. Lookup

The list books that can be added to the library is available in the [`catalog.csv`](catalog.csv) file in this repo. The first column in the CSV is the ISBN of the book, followed by the title, author, and publication date.

Please provide a method that can take an ISBN and prints all the catalog information about that book. For example:

```ruby
my_library.lookup('9780143111597')
# => The Left Hand of Darkness, by Ursula K. Le Guin (1969)
```

## 2. Add books to the library

You can add a book from the catalog to the library, and optionally add multiple copies of the same book at once.

```ruby
my_library.add('9781472258229')
my_library.add('9781472258229', 5) # Adds 5 copies of the book at once
```

## 3. Borrowing and reuturning copies of books

Books can be borrowed or returned to the library:

```ruby
my_library.borrow('9781472258229')
my_library.return('9781472258229')
```

## 4. Checking stock

You can print the available copies of books at the library. This should print all books in the catalog, even if there are zero copies in the library. It should also display how many books are available (i.e. the total number of copies of the book the library owns, minus the number of copies that have been borrowed).

```ruby
my_library.stock
# 9780143111597, Copies: 0, Available: 0
# 9781472258229, Copies: 1, Available: 0
# 9780441569595, Copies: 3, Available: 2
# 9781857231380, Copies: 0, Available: 0
# 9780553283686, Copies: 0, Available: 0
```

## Example

This is a more complete example of a script we could use to interact with the library.

```ruby
cork_city = Library.new

cork_city.lookup("9781472258229") # => 'Kindred, by Octavia E. Butler (1979)'
cork_city.add("9781472258229")

cork_city.lookup("9780441569595") # => 'Neuromancer, by William Gibson (1984)'
cork_city.add("9780441569595", 3)

cork_city.borrow("9781472258229") # Borrow a copy of 'Kindred'
cork_city.borrow("9780441569595") # Borrow a copy of 'Neuromancer'
cork_city.borrow("9780441569595") # Borrow another copy of 'Neuromancer'
cork_city.return("9780441569595") # Return a copy of 'Neuromancer'

cork_city.stock
# 9780143111597, Copies: 0, Available: 0
# 9781472258229, Copies: 1, Available: 0
# 9780441569595, Copies: 3, Available: 2
# 9781857231380, Copies: 0, Available: 0
# 9780553283686, Copies: 0, Available: 0
```
