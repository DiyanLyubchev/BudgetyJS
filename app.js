// BUDGET CONTROLLER
let budgetController = (function () { //Encapsolate 
     
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
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
        precentageLable: '.budget__expenses--percentage'
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

            html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }else if(type === 'exp'){
            element = DOMstrings.expensesContainer;

            html= '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }  

        // Replace the placeholder text with some actual data 

        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', obj.value);

        // Incert the HTML into the DOM

        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

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

           document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
           document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
           document.querySelector(DOMstrings.expenseLable).textContent = obj.totalExo;

            if(obj.precentage > 0){
                document.querySelector(DOMstrings.precentageLable).textContent = obj.precentage + '%';
            } else{
                document.querySelector(DOMstrings.precentageLable).textContent = '---';
            }

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
    };

    let updateBudget = function(){

      //1. Calculate the budget
        budgeCtrl.calculateBudget();

      //2. Return the buget  
        let budget = budgeCtrl.getBudget();

      //3. Display the budget ot the UI
        UICtrl.dislplayBudget(budget);
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
        }
        
       
    };

    return {
        init: function(){
            setupEventListeners();
        }
    };

})(budgetController , UIController);

controller.init();

