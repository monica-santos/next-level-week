import React, {
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
  FormEvent
} from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'

import logo from '../../assets/logo.svg'
import './styles.css'
import { Link, useHistory } from 'react-router-dom'
import api from '../../services/api'
import axios from 'axios'

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  id: string
  nome: string
}

interface Items {
  id: number
  title: string
  image_url: string
}

interface City {
  id: string
  name: string
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<Items[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0
  ])

  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0
  ])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setInitialPosition([latitude, longitude])
        setSelectedPosition([latitude, longitude])
      }
    )

    api.get('/items').then(({ data }) => {
      setItems(data.items)
    })

    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then(({ data }) => {
        const ufInitials = data
          .map((uf) => uf.sigla)
          .sort(function (a, b) {
            return a.localeCompare(b)
          })
        setUfs(ufInitials)
      })
  }, [])

  useEffect(() => {
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then(({ data }) => {
        const cities = data.map(({ id, nome: name }) => ({ id, name }))
        setCities(cities)
      })
  }, [selectedUf])

  const handleSelectUF = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const uf = event.target.value
      setSelectedUf(uf)
    },
    []
  )

  const handleSelectCity = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const city = event.target.value
      setSelectedCity(city)
    },
    []
  )

  const handleMapClick = useCallback((event: LeafletMouseEvent) => {
    setSelectedPosition([event.latlng.lat, event.latlng.lng])
  }, [])

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [event.target.name]: event.target.value })
      console.log(formData)
    },
    [formData]
  )

  const handleSelectItem = useCallback(
    (id: number) => {
      if (selectedItems.includes(id)) {
        setSelectedItems(selectedItems.filter((filterId) => filterId !== id))
      } else {
        setSelectedItems([...selectedItems, id])
      }
    },
    [selectedItems]
  )

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      const { name, email, whatsapp } = formData
      const uf = selectedUf
      const city = selectedCity
      const [latitude, longitude] = selectedPosition
      const items = selectedItems

      const data = {
        name,
        email,
        whatsapp,
        uf,
        city,
        latitude,
        longitude,
        items
      }

      await api.post('points', data)
      alert('Criado')

      history.push('/')
    },
    [
      formData,
      history,
      selectedCity,
      selectedItems,
      selectedPosition,
      selectedUf
    ]
  )

  return (
    <div id='page-create-point'>
      <header>
        <img src={logo} alt='Ecoleta' />
        <Link to='/'>
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className='field'>
            <label htmlFor='name'>Nome da entidade</label>
            <input
              type='text'
              id='name'
              name='name'
              onChange={handleInputChange}
            />
          </div>

          <div className='field-group'>
            <div className='field'>
              <label htmlFor='email'>Email</label>
              <input
                type='text'
                id='email'
                name='email'
                onChange={handleInputChange}
              />
            </div>
            <div className='field'>
              <label htmlFor='whatsapp'>Whatsapp</label>
              <input
                type='text'
                id='whatsapp'
                name='whatsapp'
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className='field-group'>
            <div className='field'>
              <label htmlFor='uf'>Estado (UF)</label>
              <select
                id='uf'
                name='uf'
                value={selectedUf}
                onChange={handleSelectUF}
              >
                <option value='0'>Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className='field'>
              <label htmlFor='city'>Cidade</label>
              <select
                id='city'
                name='city'
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value='0'>Selecione uma UF</option>
                {cities.map(({ id, name }) => (
                  <option key={id} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className='items-grid'>
            {items.map(({ id, title, image_url }) => (
              <li
                key={id}
                onClick={() => handleSelectItem(id)}
                className={selectedItems.includes(id) ? 'selected' : ''}
              >
                <img src={image_url} alt='Oleo' />
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type='submit'>Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint
