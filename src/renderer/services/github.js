import axios from 'axios'

export default {
  getReleases () {
    return axios.get('https://api.github.com/repos/Arges86/multi-app-launcher/releases')
      .then(response => {
        return response.data ? response.data.sort((a, b) => (a.published_at < b.published_at) ? 1 : -1) : response
      })
  }
}
