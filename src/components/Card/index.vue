<template>
  <div class='card-border'>
      <div class='card-title'>
          <p>{{title}}</p>
      </div>
      <div class='card-icon'>
          <div class=icon>
                <slot name="icon"></slot>
          </div>
      </div>
      <div class='card-figure'>
          <slot name='figure'></slot>
      </div>
  </div>
</template>

<script>
import './style.css'
export default {
    props:['title'],
    setup(props){
        return {
            ...props
        }
    }
}
</script>
