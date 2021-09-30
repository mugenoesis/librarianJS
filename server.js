const ObjectsToCsv = require('objects-to-csv')
const fs = require('fs').promises;
const headings = {
    ISBN: 0,
    TITLE: 1,
    AUTHOR: 2,
    YEAR: 3
}

let Library = {
    getRecord: async function(file){
        const parse = require('csv-parse/lib/sync');
        const content = await fs.readFile(`${__dirname}/${file}`);
        const records = parse(content);
        return records;
    },
    writeRecord: async function(records, append, file){
        const csv = new ObjectsToCsv(records);
        await csv.toDisk(`${file}`, { append: append });
        return records;
    },
    lookup: async function (isbn) {
        let records = await this.getRecord("catalog.csv");
        let bookToSendBack = [];
        records.forEach(function (value) {
            if (value[0].includes(isbn)) {
                bookToSendBack = [...value];
            }
        });
        return bookToSendBack;
    },
    getBook: async function (isbn) {
        let book = await this.lookup(isbn);
        console.log(`${book[headings.TITLE]}, by ${book[headings.AUTHOR]} (${book[headings.YEAR]})`);
    },
    add: async function (isbn, n, callback) {
        let book = await this.lookup(isbn);
        let bookAndNewLine = [];
        for (let i = 0; i < n; i++) {
            bookAndNewLine.push(book);
        }
        await this.writeRecord(bookAndNewLine, true, "./catalog.csv");

        callback();
    },
    borrowerUpdater: async function (isbn, callback) {
        let records = await this.getRecord("catalog.csv");
        let once = false;
        let recordCopy = records;
        let borrowedCopy = [];
        recordCopy.forEach(function (value) {
            if ((value[0].includes(isbn)) && once === false) {
                borrowedCopy = value;
                once = true;
            }
        });
        await this.writeRecord([borrowedCopy], true, "borrowed.csv");
        callback();
    },
    borrow: async function (isbn){
        let stock = await this.stock()
        let bookCounts = this.isbnCount(stock, isbn)

        if (bookCounts[1] < bookCounts[0]){
            await this.borrowerUpdater(isbn,function (a) {})
        }else if(bookCounts[1] === undefined){
            await this.borrowerUpdater(isbn,function (a) {})
        }
    }
    ,
    returnUpdater: async function (isbn, callback) {
        let records = await this.getRecord("borrowed.csv")
        if (records[0][0] === "0"){
            await records.shift();
        }
        let count = 0;
        let once = false;
        let recordCopy = records;
        recordCopy.forEach(function (value) {
            if ((value[0].includes(isbn)) && once === false) {
                records.splice(count, 1);
                once = true;
            }
            count++;
        });
        await this.writeRecord(records, false, "borrowed.csv");
        callback();
    },
    returnBook: async function (isbn){
        let stock = await this.stock()
        let bookCounts = this.isbnCount(stock, isbn)
        if (bookCounts[1] > 0){
            await this.returnUpdater(isbn,function (a) {});
        }
    },
    stock: async function () {
        let borrowedStock = []
        let catalogStock = []
        await this.itemsCount("catalog.csv", function (catalog) {
            catalogStock = catalog
        })
        await this.itemsCount("borrowed.csv", function (borrowed) {
            borrowedStock = borrowed
        })
        return [catalogStock, borrowedStock]

    },
    itemsCount: async function(file, callback){
        let records = await this.getRecord(`${file}`);
        let countArray = []
        records.forEach(function (value) {
            countArray.push(value[0])
        })
        const countUnique = countArray => {
            const counts = {};
            for (let i = 0; i < countArray.length; i++) {
                counts[countArray[i]] = 1 + (counts[countArray[i]] || 0);
            }
            return counts;
        };
        callback(countUnique(countArray));
    },
    isbnCount: function(stock, isbn){

        let stockIsbns = Object.keys(stock[0])
        let itemIndex = stockIsbns.indexOf(isbn)
        let stockOfRequestedBook = Object.values(stock[0])[itemIndex]

        let borrowingIsbns = Object.keys(stock[1])
        let borrowingItemIndex = borrowingIsbns.indexOf(isbn)
        let borrowingOfRequestedBook = Object.values(stock[1])[borrowingItemIndex]

        return [stockOfRequestedBook, borrowingOfRequestedBook]
    },
    stockReadout: async function () {
        let stocks = await this.stock()
        let isbns = Object.keys(stocks[0])
        let stockOfEachBook = Object.values(stocks[0])
        let borrowed = Object.keys(stocks[1])

        for(let i = 0; i< isbns.length;i++){
            let borrowingItemIndex = borrowed.indexOf(isbns[i]);
            let borrowingOfRequestedBook = Object.values(stocks[1])[borrowingItemIndex];
            if (borrowingOfRequestedBook === undefined){
                borrowingOfRequestedBook = 0;
            }
            console.log(`# ${isbns[i]}, Copies: ${stockOfEachBook[i]}, Available: ${stockOfEachBook[i]-borrowingOfRequestedBook}`)
        }

    }

}

async function consoleLog() {
    const cork_city = Object.create(Library);
    await cork_city.getBook("9781472258229");
    await cork_city.add('9781472258229', 1, function() {});
    await cork_city.add('9781857231380', 2, function() {});
    await cork_city.borrow('9781472258229');
    await cork_city.borrow('9781472258229');
    await cork_city.returnBook('9781472258229');
    await cork_city.borrow('9781857231380');
    await cork_city.stockReadout();

}

consoleLog()