let db;
const request = indexedDB.open('budget_tracker', 1);

//Initializes the transaction object store on version change or first use
request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('transactions', {autoIncrement: true});
};

request.onsuccess = function(event) {
    db = event.target.result;

    //Check if online, if yes send to api
    if(navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['transactions'], 'readwrite');

    const transactionStore = transaction.objectStore('transactions');

    transactionStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['transactions'], 'readwrite');

    const transactionStore = transaction.objectStore('transactions');

    const getAll = transactionStore.getAll();

    getAll.onsuccess = function () {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                  Accept: 'application/json, text/plain, */*',
                  'Content-Type': 'application/json'
                }
              })
              .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['transactions'], 'readwrite');

          const transactionStore = transaction.objectStore('transactions');
          
          transactionStore.clear();

          alert('All cached transactions saved');
        })
        .catch(err => {
          console.log(err);
        });
        }
    }
};

window.addEventListener('online', uploadTransaction);