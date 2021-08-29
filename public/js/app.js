//budgetcontroller module
//module pattern with IIFE - Immediately Invoked Function Expression
var budgetController = (function(){
    //capital E as its a function constructor
    var Expense = function(id, description, value, percentage) {
        this.id = id;
        this.description = description;
        this. value = value;
        this.percentage = -1;
    };
    
    //create a method for Expense objects to calculate expenses percentage
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) { 
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this. value = value;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        //sum values of the array
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        //export sum to the totals array
        data.totals[type] = sum;
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            //create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //create new item based on if its expense or income
            if(type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if(type === "inc") {
                newItem = new Income(ID, des, val);
            }
            //add new item created to the type array
            data.allItems[type].push(newItem);
            //return new item so other modules can access it
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            //loop for the id with method map
            var ids = data.allItems[type].map(function(current) {
                //the difference between map and foreach is that map returns a new array
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1) {
                //remove items starting at 'index', 1 item
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the % of income spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);  
            } else {
                //if set to -1, doesn't exist
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            })
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();

//UIcontroller module
var UIController = (function(){
    //we create this in order to fix the classes, in case in the future we change the classes from html
    //we only will have to change this variables
    var DOMstrings = {
        inputType:".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec, type;
            //format number with ., and +-
            num = Math.abs(num);
            //toFixed is a method of the number prototype, not the Math lib
            //it adds 2 decimal numbers, and rounds them
            num = num.toFixed(2);
            //divide the number into two parts
            numSplit = num.split('.');
            
            int = numSplit[0];
            
            if(int.length > 3) {
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, int.length);
            }
            
            dec = numSplit[1];
            
            //if type is exp, then sign is -, if not, +
            type === 'exp' ? sign = '-' : sign = '+'
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };
    
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        } 
    };
    
    //public methods
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                //parseFloat converts string to number
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text
            if(type === "inc") {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i> </button> </div> </div> </div>';
            } else if(type === "exp") {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            };
            
            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //insert html to the DOM, beforeend is the last one of the list in html
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorId) {
            //we can only remove a child, that is why we need to call parentNode method first
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            //we select as if it was css, with commas and spaces
            //the query selector all returns a list, not an array, so we have to convert it to array
            //as we have various methods for arrays, not for lists
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            //make fields an array
            fieldsArr = Array.prototype.slice.call(fields);
            
            //loop through each value and set it to empty
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            //set focus to first element, description
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type) + '€';
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 1) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentage) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                if(percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }
            })
        },
        
        displayMonth: function() {
            var now, year, month, monthsList;
            now = new Date();
            
            monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            month = now.getMonth();
            month = monthsList[month];
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' of ' + year;
        },
        
        changedType: function() {
              var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
              )  
          
              nodeListForEach(fields, function(cur) {
                  //toggle method adds the class if its not there, and if it is, it removes it
                  cur.classList.toggle('red-focus');
              })
            
              document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
          
        },
        
        //make DOMstrings available to the public
        getDOMstrings: function() {
            return DOMstrings;
        }
    }
})();

//controller module
//this controller now controlls the other 2 modules, and can use their code
//it is good practice to change the arguments name, just in case in the future we want to change other module names
//in this module we will call other methods of the other modules
var controller = (function(budgetCtrl, UICtrl) {
    //this function has to be called at first, to eventlisteners to run
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
	    //add event listener to global object. When keypressed 'enter'.
	    document.addEventListener('keypress', function(event) {
		  //event.which is for other browsers
		  if(event.keyCode === 13 || event.which === 13) {
			 ctrlAddItem();
		  }
	   })
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
		//3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    //update percentages
    var updatePercentages = function() {
        //1. calculate percentages
        budgetCtrl.calculatePercentages();
        //2. read them from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //3. update UI with new percentages
        UICtrl.displayPercentages(percentages);
        
    };
    
    //add item button
    var ctrlAddItem = function() {
        var input, newItem;
        //1. Get the field input data
        input = UICtrl.getInput();
        //if data is not empty, then run
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //4. Clear the fields
            UICtrl.clearFields();
            //5. Calculate and update budget
            updateBudget();
            //6. Calculate and update expenses percentages
            updatePercentages();
        };
    };
    
    //delete item button
    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, Id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId) {
            //split the ID with the - 
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            
            //1. delete the item from data structure
            budgetCtrl.deleteItem(type, ID);
            //2. delete item from UI
            UICtrl.deleteListItem(itemId);
            //3. update and show new budget
            updateBudget();
            //4. Calculate and update expenses percentages
            updatePercentages();
        }
    };
    
    //create init function and make it public by returning it
    return {
        init: function() {
            console.log("app initialized");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

//init the controller
controller.init()