/* eslint-disable */
import { provide,ref ,reactive} from 'vue'
import data from './conf/ini'

export default function setup(props) {
    for(let v in data)
    {
        provide(v,ref(data[v]))
    }
    return {}
}