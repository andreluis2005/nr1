
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tgrnmwyodinmvsxwglxr.supabase.co'
const supabaseKey = 'sb_publishable_gwox_erI8m0jCm2Mmu281A_KdMgEYtY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTable() {
    console.log('Checking if table "medidas_controle" exists...')

    // Try to select just one row to see if the relation exists
    const { data, error } = await supabase
        .from('medidas_controle')
        .select('count', { count: 'exact', head: true })

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.log('RESULT: Table "medidas_controle" DOES NOT EXIST.')
        } else {
            console.log('RESULT: Table "medidas_controle" exists (or at least threw a different error).')
            console.log('Error details:', error.message, error.code, error.details, error.hint)
        }
    } else {
        console.log('RESULT: Table "medidas_controle" EXISTS and is accessible (publicly or via generic key).')
    }
}

checkTable()
