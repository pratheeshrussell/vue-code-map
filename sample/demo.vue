<template>
    <div>
      <button @click="handleClick($event)">Click me</button>
      <CustomComponent />
      <div v-if='aConditionToBeTrue'>
        <input type="text" v-model="val" />
        <span>Hello</span>
      </div>
      
    </div>
    </template>
    
    <script>
    export default {
    data() {
     return {
        message: 'Hello, Vue!',
        aConditionToBeTrue:true
     };
     },
     computed:{
    
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