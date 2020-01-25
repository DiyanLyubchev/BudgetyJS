// BUDGET CONTROLLER
let budgetController = (function () { //Encapsolate 
     
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(current){
             sum += current.value; 
        });
        data.totals[type] = sum;
    };

     let data = {
         allItems:{
            exp: [],
            inc: []
         },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        precentage: -1
     };

     return{
         addItem: function(type , des ,val){
            let newItem, ID;

            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            //Create new item based on 'inc or 'exp type
            if(type === 'exp'){
                newItem = new Expense(ID ,des, val);
            }else if(type === 'inc'){
                newItem = new Income(ID ,des, val);
            }
            
            // Push it into our data structore
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
         },

         deleteItem: function(type, id){
            let ids, index;
           
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1); // remove element from array 
            }
         },

         calculateBudget: function(){

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.precentage = -1;
            }
         },

         calculatePercentages: function(){
            data.allItems.exp.forEach(function(currentValue){
                currentValue.calcPercentage(data.totals.inc);
            });
         },

         getPercentage: function(){
             let allPerc = data.allItems.exp.map(function(currentValue){
                return currentValue.getPercentage();
             });
             return allPerc;
         },

         getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExo: data.totals.exp,
                precentage: data.precentage
            };
         },

         testing: function(){
             console.log(data);
         }
     };

})(); 

 // UI CONTROLLER
let UIController = (function () {

    let DOMstrings = { //all html classes 
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLable: '.budget__expenses--value',
        precentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLable: '.item__percentage',
        dateLable: '.budget__title--month',
    };

   let  formatNumber = function(number, type){
        let numSplit, integer, decimal;

         number = Math.abs(number);
         number = number.toFixed(2); // give a string from number and show 2 digit after sign

         numSplit = number.split('.');

         integer = numSplit[0];
         if(integer.length > 3){
           integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3);
         }

         decimal = numSplit[1];

        return  (type === 'exp' ? sign = '-' : sign = '+') + ' ' + integer + '.' + decimal;
         
   };

    return {
         getInput: function(){
            return{
              type: document
             .querySelector(DOMstrings.inputType).value, //will be either inc or exp
              description: document
             .querySelector(DOMstrings.inputDescription).value,
              value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
         },

        addListItem: function(obj, type){
            
        let html, newHtml, element; 

        // Create HTML string with placeholder text

        if(type === 'inc') { 
            element = DOMstrings.incomeContainer;

            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }else if(type === 'exp'){
            element = DOMstrings.expensesContainer;

            html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }  

        // Replace the placeholder text with some actual data 

        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

        // Incert the HTML into the DOM

        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

       },

       deleteListItem: function(selectorId){

            let element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
       },

       clearFields: function(){
        let fields, fieldArr;

        fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);    

        fieldArr = Array.prototype.slice.call(fields);

        fieldArr.forEach(function(currentValue, index, array) {
            currentValue.value = "";
        });

        fieldArr[0].focus();
       },

       dislplayBudget: function(obj){
           let type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';
           document.querySelector(DOMstrings.budgetLabel).textContent =formatNumber(obj.budget, type);
           document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
           document.querySelector(DOMstrings.expenseLable).textContent =formatNumber(obj.totalExo, 'exp');

            if(obj.precentage > 0){
                document.querySelector(DOMstrings.precentageLable).textContent = obj.precentage + '%';
            } else{
                document.querySelector(DOMstrings.precentageLable).textContent = '---';
            }

       },

       displayPercentages: function(percentages){
           let fields, nodeListForEach;

            fields = document.querySelectorAll(DOMstrings.expensesPercLable);
            nodeListForEach = function(list, callback){
                 for (let index = 0; index < list.length; index++) {
                     callback(list[index] , index);
                     
                 }
            };  

            nodeListForEach(fields , function(current , index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });

       },

       displayMonth: function(){
            let now, year, month, monthArray;
            now = new Date();

            month = now.getMonth();

            monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'
        ,'September', 'October', 'November', 'December'];

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLable).textContent = monthArray[month] + ' ' +  year;
       },
     
        getDOMstrings: function(){
           return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER
let controller = (function (budgeCtrl, UICtrl) {

    let setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn)
        .addEventListener('click', ctrlAddItem); //callback
    
        document.addEventListener('keypress' , function (event){
    
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click' , ctrlDeleteItem);

    };

    let updateBudget = function(){

      //1. Calculate the budget
        budgeCtrl.calculateBudget();

      //2. Return the buget  
        let budget = budgeCtrl.getBudget();

      //3. Display the budget ot the UI
        UICtrl.dislplayBudget(budget);
    };

    let updatePercentages = function() {
        //1. Calculate percentages
        budgeCtrl.calculatePercentages();

        //2. Read percentages from the pudget controller
        let percentages = budgeCtrl.getPercentage();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };

    let ctrlAddItem = function(){
       let input, newItem;

        //1. Get the filed input data 

        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){             //2. Add the item to the budget controller 
            newItem =  budgeCtrl.addItem(input.type, input.description , input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update  budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();
        }
       
    };

    let ctrlDeleteItem = function(event){
        let itemId, splitId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //1. delete the item from the data
            budgeCtrl.deleteItem(type, ID);

            //2. delete the item from the UI
            UICtrl.deleteListItem(itemId);

            //3 update and show new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }

    };

    return {
        init: function(){
            UICtrl.dislplayBudget({  budget: 0,
                totalInc: 0,
                totalExo: 0,
                precentage: -1});
                UICtrl.displayMonth();
            setupEventListeners();

        }
    };

})(budgetController , UIController);

controller.init();


