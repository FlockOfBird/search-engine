<template>
  <v-container class="align-center">
    <v-row class="w-100 my-3 text-center justify-center align-center">
      <v-img class="text-center px-2 justify-center" max-width="150" src="public/favicon.png"></v-img>
      <div class="justify-center text-start">
        <p class="text-h3 mb-3">University of Windsor</p>
        <p class="text-h5 text-amber-accent-1t">Information Retrieval Systems</p>
      </div>
    </v-row>
    <v-row align="center" justify="center" class="pa-3 w-100 mt-6">
      <v-responsive max-width="580">
        <v-combobox
          v-model="search_input"
          class="flex-full-width"
          append-inner-icon="mdi-arrow-right"
          clearable
          hide-details
          :disabled="options.length === 0"
          @keyup.enter="search(search_input, year, search_type, options)"
          @click:append-inner="search(search_input, year, search_type, options)"
          :prepend-inner-icon="
             options.length > 1 ? 'mdi-magnify'
            :options.includes('1') ? 'mdi-account-edit'
            :options.includes('0') ? 'mdi-format-title'
            :options.includes('2') ? 'mdi-calendar'
            : ''"
          :search-input.sync="search_input"
          color="blue"
          menu-icon=""
          placeholder="Search through documents, authors, years ..."
          variant="underlined"
        />
      </v-responsive>
    </v-row>
    <v-row align="center" justify="center" class="pa-3 w-100 mt-0">
      <div>
        <v-chip-group
          v-model="options"
          class="justify-center d-inline-block"
          color="blue"
          multiple
        >
          <v-chip
            filter
            value="0"
            variant="outlined"
          >
            Title
          </v-chip>
          <v-chip
            filter
            value="1"
            variant="outlined"
          >
            Author
          </v-chip>
          <v-chip
            filter
            class=""
            value="2"
            variant="outlined"
          >
            Date
          </v-chip>
        </v-chip-group>
      </div>
      <div class="overflow-visible mb-1">
        <VueDatePicker @keyup.enter="search(search_input, year, options)"
                       :disabled="!options.includes('2')"
                       class="py-1 pb-2 "
                       range
                       v-model="year"
                       year-picker
                       style="width: 160px;"/>
      </div>
      <div>
        <v-select
          variant="outlined"
          hide-details
          density="compact"
          v-model="search_type"
          color="blue"
          class="mx-2 smaller mb-2"
          rounded
          style="width: 155px; font-size: 10rem; padding: 0px;"
          :items="['', 'book', 'www', 'article', 'inproceedings', 'proceedings', 'phdthesis', 'incollection']"
        ></v-select>
      </div>
    </v-row>
    <v-row align="start" justify="start" class="pa-3 mt-3 fill-height">
      <v-overlay
        :model-value="overlay"
        persistent
        class="align-center justify-center"
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
      <v-col xl="3" lg="3" md="4" sm="6" xs="12" v-for="(item, i) in search_results" :key="i">
        <v-hover v-slot="{ isHovering, props }">
          <div class="text-end">
            <v-btn
              class="text-end text-sm-body-2"
              color=""

              width="90"
              icon="mdi-arrow-left"
              variant="flat"
              style="z-index: 1; margin-bottom: -24px; pointer-events: none;"
            >
              score: {{Math.round(item.score * 100) / 100}}
            </v-btn>
          </div>
          <v-card
            class="mx-auto card-outter rounded-xl bg-white pa-1"
            v-bind="props"
            :elevation="isHovering ? 7 : 0"
            variant="outlined"
          >

            <v-card-item>
              <div>
                <div class="text-h6 my-1"><span class="highlight"  v-html="item.title"/>

                </div>
                <div class="text-subtitle-2 my-2">
                  <p class="d-inline-block" v-if="item.year">{{item.year}},</p> <p class="d-inline-block">{{item.type}}</p>
                  <v-btn class="mx-3 mb-3" flat icon="mdi-open-in-new" density="compact" size="10" :href="item.url" target="_blank">
                </v-btn>
                </div>
                <div class="text-subtitle-1 my-2 mt-4" >
                  <v-chip @click="search_author(auth)" :color="auth === search_input ? 'blue' : ''" class="mr-1 mb-1 py-3" density="compact" v-for="(auth, j) in item.author">{{ auth }}</v-chip>
                </div>
              </div>
            </v-card-item>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { VDatePicker } from 'vuetify/labs/VDatePicker'

export default {
  components: {
    VDatePicker,
  },
  data: () => ({
    overlay: false,
    search_input:'',
    year: [2000,2023],
    search_type: 'all',
    items: ['recipe with chicken', 'best hiking trails near me', 'how to learn a new language'],
    variants: ['elevated', 'flat', 'tonal', 'outlined'],
    options: [],
    search_results: [],
    text: [0,1,2,3,4]
  }),
  watch: {
    menu (val) {
      val && this.$nextTick(() => (this.$refs.picker.activePicker = 'YEAR'))
    }
  },
  methods:{
    search: function(search_input, year, search_type, options){
      this.overlay = true

      let params = {
        'Title': options.includes('0') ? search_input : null,
        'Author': options.includes('1') ? search_input : null,
        'type': search_type,
        'YearFrom': options.includes('2') ? year[0] : null,
        'YearTo': options.includes('2') ? year[1] : null
      }
      console.log(params)
      const baseURI = 'http://search.smano.ir/Search/search'
      this.axios.get(baseURI, { params: params })
        .then((result) => {
          console.log('result', result)
          this.overlay = false
          this.search_results = result.data.results
        })
        .catch((error) => {
          console.error('error:', error);
          this.overlay = false
        });
    },
    search_author: function(author){
      this.overlay = true

      this.options = ["1"]
      this.search_input = author

      let params = {
        'Title': null,
        'YearFrom': null,
        'YearTo': null,
        'type': null,
        'Author': author
      }

      const baseURI = 'http://search.smano.ir/Search/search'
      this.axios.get(baseURI, { params: params })
        .then((result) => {
          console.log('result', result)
          this.overlay = false
          this.search_results = result.data.results
        })
        .catch((error) => {
          console.error('error:', error);
          this.overlay = false
        });
    }
  }
}
</script>

<style>
.card-outter {
  padding-bottom: 50px;
}
.card-actions {
  position: absolute;
  padding-bottom: 5px;
  bottom: 0;
}
.highlight em {
  color: #2196F3;
  font-style: normal;
}

.smaller .v-field__input{
  //background-color: red;
  height: 30px;
  padding: 0px;
  font-size: 0.98rem;
  padding-bottom: 9px;
  padding-left: 13px;
  margin-bottom: 0px;
}
.smaller .v-input__control{
  //background-color: #76d275;
  height: 34px;
}
.smaller .mdi-menu-down{
  margin-bottom: 7px;
}

.dp__theme_light {
  --dp-cell-padding: 1px;
  --dp-common-padding: 2px;
  --dp-input-padding: 3px;
  --dp-background-color: #ffffff;
  --dp-text-color: #212121;
  --dp-hover-color: #f3f3f3;
  --dp-hover-text-color: #212121;
  --dp-hover-icon-color: #959595;
  --dp-primary-color: #2196F3;
  --dp-primary-text-color: #f8f5f5;
  --dp-secondary-color: #c0c4cc;
  --dp-border-color: #959595;
  --dp-border-radius: 18px;
  --dp-action-buttons-padding: 15px;
  --dp-menu-border-color: #959595;
  --dp-border-color-hover: #2196F3;
  --dp-disabled-color: #f6f6f6;
  --dp-scroll-bar-background: #f3f3f3;
  --dp-scroll-bar-color: #959595;
  --dp-success-color: #76d275;
  --dp-success-color-disabled: #a3d9b1;
  --dp-icon-color: #959595;
  --dp-danger-color: #ff6f60;
  --dp-highlight-color: rgba(25, 118, 210, 0.1);
}

</style>

