package work.onss.heroman.data.repository.key

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class Key(@PrimaryKey val id: Int, val prevKey: Int?, val nextKey: Int?)