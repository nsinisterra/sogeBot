<template>
  <b-container fluid ref="window">
    <b-row>
      <b-col>
        <span class="title text-default mb-2">
          {{ translate('menu.registry') }}
          <small><i class="fas fa-angle-right"></i></small>
          {{ translate('menu.custom-variables') }}
          <template v-if="state.loaded && $route.params.id">
            <small><i class="fas fa-angle-right"></i></small>
            {{variableName}}
            <small>{{$route.params.id}}</small>
          </template>
        </span>
      </b-col>
    </b-row>

    <panel>
      <template v-slot:left>
        <button-with-icon class="btn-secondary btn-reverse" icon="caret-left" href="#/registry/customvariables/list">{{translate('commons.back')}}</button-with-icon>
        <hold-button v-if="$route.params.id" icon="trash" class="btn-danger" @trigger="remove()">
          <template slot="title">{{translate('dialog.buttons.delete')}}</template>
          <template slot="onHoldTitle">{{translate('dialog.buttons.hold-to-delete')}}</template>
        </hold-button>
      </template>
      <template v-slot:right>
        <b-alert show variant="info" v-if="pending" v-html="translate('dialog.changesPending')" class="mr-2 p-2 mb-0"></b-alert>
        <b-alert show variant="danger" v-if="error" v-html="error" class="mr-2 p-2 mb-0"></b-alert>
        <state-button @click="save()" text="saveChanges" :state="state.save"/>
      </template>
    </panel>

    <loading v-if="!state.loaded /* State.DONE */" />
    <b-form v-else>
      <b-form-group
        :label="translate('registry.customvariables.variable.name')"
        label-for="variableName"
        :description="translate('registry.customvariables.variable.help')"
      >
        <b-form-input
          id="variableName"
          v-model="variableName"
          type="text"
          :placeholder="translate('registry.customvariables.variable.placeholder')"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        :label="translate('registry.customvariables.description.name')"
        label-for="description"
        :description="translate('registry.customvariables.description.help')"
      >
        <b-form-input
          id="description"
          v-model="description"
          type="text"
          :placeholder="translate('registry.customvariables.description.placeholder')"
        ></b-form-input>
      </b-form-group>

      <b-form-group>
        <label>{{translate('registry.customvariables.urls')}}</label> <b-button size="sm" :variant="showCurlExample ? 'secondary' : 'outline-secondary'" @click="showCurlExample = !showCurlExample">{{translate('registry.customvariables.show-examples')}}</b-button>
        <b-row v-if="showCurlExample">
          <b-col class="mb-0 p-3 mt-3 ml-3 mr-3 border">
            <kbd style="font-size: 0.7rem;">
              $ curl -X GET {{origin}}/customvariables/&lt;generated-id&gt; <br/>
              { "value": "{{currentValue}}" }
            </kbd>
          </b-col>
          <b-col class="mb-0 p-3 mt-3 ml-3 mr-3 border">
            <kbd style="font-size: 0.7rem;">
              $ curl -X POST {{origin}}/customvariables/&lt;generated-id&gt; -H "Content-Type:
 application/json" -d '{ "value": "yourNewValue" }' <br/>
              { "oldValue": "{{currentValue}}", "value": "yourNewValue" }
            </kbd>
          </b-col>
        </b-row>
        <b-row v-if="showCurlExample">
          <b-col class="mb-0 p-3 mt-3 ml-3 mr-3 border">
            <kbd style="font-size: 0.7rem;">
              $ curl -X GET {{origin}}/customvariables/&lt;generated-id&gt; <br/>
              { "error": "This endpoint is not enabled for GET", code: 403 }
            </kbd>
          </b-col>
          <b-col class="mb-0 p-3 mt-3 ml-3 mr-3 border">
            <kbd style="font-size: 0.7rem;">
              $ curl -X POST {{origin}}/customvariables/&lt;generated-id&gt; -H "Content-Type:
 application/json" -d '{ "value": "yourNewValue" }' <br/>
              { "error": "This endpoint is not enabled for POST", code: 400 }
            </kbd>
          </b-col>
        </b-row>
        <b-row v-if="showCurlExample">
          <b-col class="p-3 m-3"></b-col>
          <b-col class="p-3 m-3 border">
            <kbd style="font-size: 0.7rem;">
              $ curl -X POST {{origin}}/customvariables/&lt;generated-id&gt; -H "Content-Type:
 application/json" -d '{ "value": "yourNewValue" }' <br/>
              { "error": "This value is not applicable for this endpoint", code: 400 }
            </kbd>
          </b-col>
        </b-row>
        <b-row v-if="showCurlExample">
          <b-col class="p-3 m-3"></b-col>
          <b-col class="p-3 m-3 border">
            <kbd style="font-size: 0.7rem;">
              $ curl -X POST {{origin}}/customvariables/&lt;generated-id&gt; -H "Content-Type:
 application/json" -d '{ "value": "yourNewValue" }' <br/>
              { "error": "This value is not applicable for this endpoint", acceptableValues: ['value1', 'value2'], code: 400 }
            </kbd>
          </b-col>
        </b-row>
        <b-list-group>
          <b-list-group-item v-for="url of urls" :key="url.id" class="p-0 d-flex">
            <b-button-group size="sm" class="btn-block" style="flex-basis: 0;">
              <b-button :variant="url.access.GET ? 'success' : 'danger'" @click="url.access.GET = !url.access.GET">GET</b-button>
              <b-button :variant="url.access.POST ? 'success' : 'danger'" @click="url.access.POST = !url.access.POST">POST</b-button>
            </b-button-group>
            <div class="w-100 p-2">{{origin}}/customvariables/{{url.id}}</div>
            <b-button-group size="sm" class="btn-block" style="flex-basis: 0;">
              <hold-button class="btn-danger btn-sm" icon="trash" @trigger="removeURL(url.id)"/>
            </b-button-group>
          </b-list-group-item>
          <b-list-group-item button variant="info" @click="generateURL"><fa icon="plus"/> {{ translate('registry.customvariables.generateurl') }}</b-list-group-item>
        </b-list-group>
      </b-form-group>

      <b-row>
        <b-col>
          <b-form-group
            :label="translate('registry.customvariables.response.name')"
            label-for="response"
          >
            <button :class="[responseType === 0 ? 'btn-primary' : 'btn-outline-primary']" type="button" class="btn" @click="responseType = 0; responseText = ''">{{ translate('registry.customvariables.response.default') }}</button>
            <button :class="[responseType === 1 ? 'btn-primary' : 'btn-outline-primary']" type="button" class="btn" @click="responseType = 1; responseText = ''">{{ translate('registry.customvariables.response.custom') }}</button>
            <button ref="tooltip1" :class="[responseType === 2 ? 'btn-primary' : 'btn-outline-primary']" type="button" class="btn" @click="responseType = 2; responseText = ''">{{ translate('registry.customvariables.response.command') }}
              <fa icon="question"/>
            </button>

            <b-tooltip :target="() => $refs['tooltip1']" placement="bottom" triggers="hover">
              {{translate('registry.customvariables.useIfInCommand')}}
            </b-tooltip>
          </b-form-group>
          <b-form-group
            v-if="responseType === 1"
            :description="translate('registry.customvariables.response.default-help')"
          >
            <b-form-input
              v-model="responseText"
              type="text"
              :placeholder="translate('registry.customvariables.response.default-placeholder')"
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            :label="translate('registry.customvariables.permissionToChange')"
            label-for="permission"
          >
            <b-form-select plain v-model="permission" id="permission">
              <option v-for="p of permissions" v-bind:value="p.id" :key="p.id">
                {{ getPermissionName(p.id) | capitalize }}
              </option>
            </b-form-select>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-form-group
            :label="translate('registry.customvariables.type.name')"
            label-for="type"
          >
            <b-form-select plain v-model="selectedType" id="selectedType">
              <option v-for="type in types" v-bind:value="type.value" :key="type.value">
                {{ type.text }}
              </option>
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            :label="translate('registry.customvariables.currentValue.name')"
            label-for="type"
          >
            <b-input-group>
              <b-form-input
                v-if="selectedType !== 'options'"
                v-model="currentValue"
                :type="selectedType"
                :readonly="(['', 'eval'].includes(selectedType))"
                :placeholder="translate('registry.customvariables.response.default-placeholder')"
              ></b-form-input>
              <b-form-select plain v-model="currentValue" id="selectedType" v-else>
                <option v-for="option in usableOptionsArray" :value="option" :key="option">{{ option }}</option>
              </b-form-select>
              <b-input-group-append v-if="selectedType !== 'eval'">
                <b-button :variant="readOnly ? 'danger' : 'success'" @click="readOnly = !readOnly">
                  <template v-if="readOnly">
                    {{ translate('registry.customvariables.isReadOnly') }}
                  </template>
                  <template v-else>
                    {{ translate('registry.customvariables.isNotReadOnly') }}
                  </template>
                </b-button>
              </b-input-group-append>
            </b-input-group>
            <small class="form-text text-muted" v-html="translate('registry.customvariables.currentValue.help')"></small>
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group
        v-if="selectedType.toLowerCase() === 'options'"
        :label="translate('registry.customvariables.usableOptions.name')"
        label-for="usableOptions"
      >
        <b-form-input
          id="usableOptions"
          v-model="usableOptions"
          :placeholder="translate('registry.customvariables.usableOptions.placeholder')"
        ></b-form-input>
        <small class="form-text text-muted" v-html="translate('registry.customvariables.usableOptions.help')"></small>
      </b-form-group>

      <b-row v-if="selectedType.toLowerCase() === 'eval'">
        <b-col cols="8">
          <label for="inline-form-input-name">{{translate('registry.customvariables.scriptToEvaluate')}}</label>
          <codemirror
            style="font-size: 12px;"
            v-model="evalValue"
            :options="cmOptions"
          />
        </b-col>
        <b-col cols="4">
          <label for="selectedRunEvery">{{ translate('registry.customvariables.runScript.name') }}</label>
            <div class="d-flex">
              <b-form-select plain v-model="selectedRunEvery" id="selectedRunEvery">
                <option v-for="option in runEveryOptions" v-bind:value="option.type" v-bind:key="option.type">
                  {{ translate('registry.customvariables.runEvery.' + option.type) }}
                </option>
              </b-form-select>
              <b-form-input
                id="RunEvery"
                type="number"
                min="0"
                v-model="runEveryX"
                v-if="selectedRunEvery !== 'isUsed'"
              />
            </div>

            <button type="button" class="btn btn-block btn-info mt-4" v-on:click="testScript()" :disabled="state.test != State.IDLE">
              <fa icon="spinner" spin v-if="state.test === State.PROGRESS"/>
              {{ translate('registry.customvariables.testCurrentScript.name') }}
            </button>
            <small class="form-text text-muted" v-html="translate('registry.customvariables.testCurrentScript.help')"></small>
            <pre v-if="evalError" class="alert alert-danger mt-2">{{ evalError }}</pre>
        </b-col>
      </b-row>


      <b-form-group
        v-if="selectedType.toLowerCase() !== 'eval' && $route.params.id"
        :label="translate('registry.customvariables.history')"
        label-for="history"
      >
        <b-table class="hide-headers" :fields="['time', 'sender', 'newValue']" :items="history" borderless small>
          <template slot="time" slot-scope="data">
            {{data.item.timestamp | moment('LL')}} {{ data.item.timestamp | moment('LTS') }}
          </template>
          <template slot="sender" slot-scope="data">
            {{ data.value ? data.value : 'Dashboard'}}
          </template>
          <template slot="newValue" slot-scope="data">
            {{ data.item.currentValue }}
          </template>
        </b-table>
      </b-form-group>
    </b-form>
  </b-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { chunk, orderBy, get } from 'lodash';
import uuid from 'uuid/v4';

import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';

import evalDefault from './custom-variables-code.txt';

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate' // for vue-router 2.2+
])

type State = { IDLE: 0, PROGRESS: 1, DONE: 2, ERROR: 3 }
const State: State = { IDLE: 0, PROGRESS: 1, DONE: 2, ERROR: 3 }

@Component({
  components: {
    'loading': () => import('../../../components/loading.vue'),
    codemirror,
  },
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
})
export default class customVariablesEdit extends Vue {
  socket = io('/registry/customVariables', { query: "token=" + this.token });
  psocket = io('/core/permissions', { query: "token=" + this.token });

  error: any = null;

  State: State = State;
  state: { loaded: boolean; save: number; test: number } = { loaded: false, save: 0, test: State.IDLE }
  pending: boolean = false;

  types = [{
      value: 'number',
      text: this.translate('registry.customvariables.types.number')
    },
    {
      value: 'text',
      text: this.translate('registry.customvariables.types.text')
    },
    {
      value: 'options',
      text: this.translate('registry.customvariables.types.options')
    },
    {
      value: 'eval',
      text: this.translate('registry.customvariables.types.eval')
    }];
  runEveryOptions = [
    { value: 0, type: 'isUsed' },
    { value: 1000, type: 'seconds' },
    { value: 1000 * 60, type: 'minutes' },
    { value: 1000 * 60 * 60, type: 'hours' },
    { value: 1000 * 60 * 60 * 24, type: 'days' },
  ]

  selectedType: string = 'text';
  selectedRunEvery: string = 'isUsed';
  runEveryX: number = 1;

  showCurlExample: boolean = false;

  variableName: string = '';
  description: string = '';
  currentValue: string = '';
  usableOptions: string = '';
  readOnly: boolean = false;
  permission: string | null = null;
  urls: { id: string; access: { GET: boolean; POST: boolean }}[] = [];

  evalValue: string = evalDefault;
  evalError: string | null = null
  cmOptions = {
    mode:  "javascript",
    tabSize: 2,
    lineNumbers: true,
    matchBrackets: true,
    lint: {
      esversion: 6
    },
    gutters: ["CodeMirror-lint-markers"]
  }

  responseType: number = 0;
  responseText: string = '';

  history: any[] = [];
  permissions: any[] = [];

  async mounted() {
    this.state.loaded = false;
    await Promise.all([
      new Promise(resolve => {
        this.psocket.emit('find', {}, (err, data) => {
          if (err) return console.error(err)
          this.permissions = orderBy(data, 'order', 'asc')

          if (!this.$route.params.id) {
            if (!this.permission) {
              this.permission = orderBy(this.permissions, 'order', 'asc').pop().id
            }
          }
          resolve()
        })
      }),
      new Promise(resolve => {
        if (this.$route.params.id) {
          this.socket.emit('load', this.$route.params.id, (data) => {
            this.variableName = data.variable.variableName;
            this.description = data.variable.description;
            this.currentValue = data.variable.currentValue;
            this.usableOptions = data.variable.usableOptions;
            this.evalValue = data.variable.type === 'eval' ? data.variable.evalValue : evalDefault;
            this.selectedRunEvery = data.variable.runEveryType;
            this.runEveryX = data.variable.runEvery / data.variable.runEveryTypeValue || 1;
            this.selectedType = data.variable.type;
            this.responseType = data.variable.responseType;
            this.responseText = data.variable.responseText;
            this.urls = data.variable.urls || [];
            this.permission = data.variable.permission || 0;
            this.readOnly = data.variable.readOnly || false;
            for (let h of data.history) {
              // change timestamp to milliseconds
              h.timestamp = new Date(h.timestamp).getTime();
            }
            this.history = chunk(orderBy(data.history, 'timestamp', 'desc'), 15)[0] || [];
            resolve();
          })
        } else {
          resolve();
        }
      })
    ])
    this.state.loaded = true;
  }

  beforeRouteUpdate(to, from, next) {
    if (this.pending) {
      const isOK = confirm('You will lose your pending changes. Do you want to continue?')
      if (!isOK) {
        next(false);
      } else {
        next();
      }
    } else {
      next();
    }
  }

  beforeRouteLeave(to, from, next) {
    if (this.pending) {
      const isOK = confirm('You will lose your pending changes. Do you want to continue?')
      if (!isOK) {
        next(false);
      } else {
        next();
      }
    } else {
      next();
    }
  }

  @Watch('variableName')
  @Watch('description')
  @Watch('currentValue')
  @Watch('usableOptions')
  @Watch('evalValue')
  @Watch('selectedRunEvery')
  @Watch('runEveryX')
  @Watch('selectedType')
  @Watch('responseType')
  @Watch('responseText')
  @Watch('urls')
  @Watch('permission')
  @Watch('readOnly')
  setPendingState() {
    if (this.state.loaded) {
      this.pending = true;
    }
  }

  @Watch('variableName')
  formatvariableName() {
    this.variableName = this.variableName
      .replace(/\$_/g, '')
      .replace(/ /g, '_')
      .trim();
    if (!this.variableName.startsWith('$_')) {
      this.variableName = '$_' + this.variableName;
    }
  }

  @Watch('selectedType')
  @Watch('usableOptionsArray')
  setDefaultValue(value) {
    if (this.selectedType === 'options') {
      if (!this.usableOptionsArray.includes(this.currentValue)) {
        this.currentValue = this.usableOptionsArray.length > 0 ? this.usableOptionsArray[0] : ''
      }
    }
  }

  get usableOptionsArray() {
    if (typeof this.usableOptions === 'string') {
      return this.usableOptions.split(',').map((o) => o.trim()).filter((o) => o.length > 0)
    } else {
      return []
    }
  }

  get origin() {
    return window.location.origin;
  }

  generateURL() {
    this.urls.push({
      id: uuid(),
      access: { GET: false, POST: false }
    });
  }

  removeURL(id) {
    this.urls = this.urls.filter(o => o.id !== id);
  }

  getPermissionName(id) {
    if (!id) return 'Disabled'
    const permission = this.permissions.find((o) => {
      return o.id === id
    })
    if (typeof permission !== 'undefined') {
      if (permission.name.trim() === '') {
        return permission.id
      } else {
        return permission.name
      }
    } else {
      return null
    }
  }

  testScript () {
    this.state.test = State.PROGRESS;
    this.socket.emit('test.script', { evalValue: this.evalValue, currentValue: this.currentValue }, (err, response) => {
      if (err) {
        this.evalError = err;
      } else {
        this.evalError = null;
      }
      this.currentValue = response
      this.state.test = State.IDLE
    })
  }

  async remove () {
    await new Promise(resolve => {
      this.socket.emit('delete', this.$route.params.id, () => {
        resolve();
      })
    })
    this.$router.push({ name: 'CustomVariableList' });
  }

  async save () {
    this.state.save = State.PROGRESS

    try {
      await Promise.all([
        // check if variable name is unique
        new Promise((resolve, reject) => {
          this.socket.emit('isUnique', { variable: this.variableName, id: this.$route.params.id }, (err, isUnique) => {
            if (!isUnique) {
              reject(this.translate('registry.customvariables.variable.error.isNotUnique'))
            }
            resolve()
          })
        }),
        new Promise((resolve, reject) => {
          this.variableName.replace(/\$_/g, '').trim().length > 0
            ? resolve()
            : reject(this.translate('registry.customvariables.variable.error.isEmpty'))
        }),
        new Promise((resolve, reject) => {
          this.selectedType !== 'options' || (this.usableOptionsArray.length > 0 && this.selectedType === 'options')
            ? resolve()
            : reject(this.translate('registry.customvariables.usableOptions.error.atLeastOneValue'))
        })
      ])

      const data = {
        _id: this.$route.params.id,
        variableName: this.variableName,
        description: this.description,
        currentValue: this.currentValue,
        urls: this.urls,
        usableOptions: this.usableOptions || '',
        evalValue: this.evalValue,
        runEvery: this.selectedType === 'eval'
          ? get(this.runEveryOptions.find((o) => o.type === this.selectedRunEvery), 'value', 0) * this.runEveryX
          : 0,
        runEveryType:  this.selectedType === 'eval' ? this.selectedRunEvery : 'isUsed',
        runEveryTypeValue:  this.selectedType === 'eval'
          ? get(this.runEveryOptions.find((o) => o.type === this.selectedRunEvery), 'value', 0)
          : 0,
        type: this.selectedType,
        readOnly: this.readOnly,
        responseType: this.responseType,
        responseText: this.responseText,
        permission: this.permission
      }
      this.socket.emit('save', data, (err, _id) => {
        if (err) {
          console.error(err)
          return this.state.save = State.ERROR
        }
        this.state.save = State.DONE
        this.error = null;
        this.pending = false;
        this.$router.push({ name: 'CustomVariableEdit', params: { id: _id } });
      })
    } catch (e) {
      this.state.save = State.ERROR
      this.error = e
    }

    setTimeout(() => {
      this.state.save = State.IDLE
    }, 1000)
  }
}
</script>

<style>
  table.hide-headers thead { display: none !important; }
</style>