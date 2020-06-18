# Scripts for parsing balances of SNGLS token

Launch scripts from sngls-balances directory, not from sngls-balances/script directory.

Before launching scripts you need to put etherscan .csv transactions list from which scripts will parse from address (for example transactions to token sale contract) to sngls-balances/tokenSaleTrxs.csv. Also you need to put array of preminted accounts (for example from token constructor) to premintedArray.json file.

Scripts:

1. getAddressesFromTrxs.js - it parses tokenSaleTrxs.csv file (which is .csv file with trancastions to SNGLS token sale contract) and writes array of addresses to tokenSaleAddressesArray.json file.
2. getEvents.js - it gets transfer events from blockchain and writes calculated value with addresses to balancesFromTransfers.json file.
3. createBalancesArray.js - gets balancesFromTransfers.json, premintedArray.json and tokenSaleAddressesArray.json. Then creates one array with non-repeating addresses and write them to the addressesArray.json file.
4. getActualBalances.js - gets file with addresses array and requests balanceOf for this addresses. Then writes addresses with actual token balances to balancesFromChain.json file.
5. getSum.js - gets file with balances and calculates sum of the balances and prints it to the console.
6. createCSVFile.js - gets file with balances and writes balances it etherscan-like csv format.
7. printBlockNumber.js - simple script for testing connection to node and requesting current blocknumber.
