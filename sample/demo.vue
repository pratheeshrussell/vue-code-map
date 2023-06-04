<template>
  <div>
    <button @click="handleClick($event)">Click me</button>
    <CustomComponent :message="message" />
    <div v-if='aConditionToBeTrue'>
      <input type="text" v-model="getAConditionToBeTrue" />
      <span>Hello</span>
    </div>
    <div v-else-if='!aConditionToBeTrue'>
      <span>False cond</span>
    </div>
    <div v-else>
      <span>Will never trigger</span>
    </div>
  
    <div v-for='fruit in fruitList'>
      <span>{{fruit}}</span>
    </div>
    
  </div>
  </template>
  
  <script>
  export default {
  data() {
   return {
      message: 'Hello, Vue!',
      aConditionToBeTrue:true,
      fruitList: ['apple','orange']
   };
   },
   computed:{
    getMessage(){
      return this.message;
    },
    getAConditionToBeTrue:{
      get(){
        return this.aConditionToBeTrue;
      },
      set(val){
        this.aConditionToBeTrue = val;
      }
    }
   },
   watch:{
    getAConditionToBeTrue:{
      handler(){
        this.defaultFunction();
      }
    },
    getBConditionToBeTrue(){
      if (this.aConditionToBeTrue) {
        this.defaultFunction();
      }
    },
    getCConditionToBeTrue(){
       
    }

   },
   mounted(){
  
   },
   methods: {
     handleClick() {
       if (aConditionToBeTrue) {
         this.firstFunction();
         this.defaultFunction();
       } else if (aConditionToBeTrue == 2) {
          this.thirdFunction();
        } else {
         this.secondFunction();
       }
       this.defaultFunction();
     },
     firstFunction(expression = 'x') {
       // Function implementation
       switch(expression) {
          case 'x':
            this.secondFunction();
            break;
          case 'y':
            this.thirdFunction();
            break;
          case 'z':
            break;
          default:
            this.defaultFunction();
        }
     },
     secondFunction() {
       // Function implementation
     },
     thirdFunction() {
      // Function implementation
      externalServiceCall();
    },
    defaultFunction() {
      // Function implementation
      this.thirdFunction();
    }
  
   }
  }
  </script>